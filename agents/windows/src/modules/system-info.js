import si from 'systeminformation'
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export class WindowsSystemInfo {
  constructor() {
    this.initialized = false
    this.systemInfo = {}
  }

  async initialize() {
    try {
      // Obtener información del sistema
      this.systemInfo = await si.getStaticData()
      this.initialized = true
    } catch (error) {
      throw new Error(`Error inicializando WindowsSystemInfo: ${error.message}`)
    }
  }

  async getFullSystemInfo() {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      // Obtener información específica de Windows
      const [cpu, memory, osInfo, network, disk] = await Promise.all([
        si.cpu(),
        si.mem(),
        si.osInfo(),
        si.networkInterfaces(),
        si.diskLayout()
      ])

      // Obtener información específica de Windows via PowerShell
      const windowsInfo = await this.getWindowsSpecificInfo()

      return {
        platform: 'windows',
        computerName: os.hostname(),
        osVersion: osInfo.release,
        osBuild: windowsInfo.build,
        architecture: os.arch(),
        cpu: {
          manufacturer: cpu.manufacturer,
          brand: cpu.brand,
          cores: cpu.cores,
          physicalCores: cpu.physicalCores,
          speed: cpu.speed
        },
        memory: {
          total: memory.total,
          available: memory.available,
          used: memory.used
        },
        network: network.filter(iface => iface.operstate === 'up'),
        disk: disk,
        domain: windowsInfo.domain,
        workgroup: windowsInfo.workgroup,
        joinedDomain: windowsInfo.joinedDomain,
        powerShellVersion: windowsInfo.powerShellVersion,
        dotNetVersions: windowsInfo.dotNetVersions,
        antivirus: windowsInfo.antivirus,
        firewall: windowsInfo.firewall,
        windowsUpdate: windowsInfo.windowsUpdate,
        lastBoot: windowsInfo.lastBoot,
        uptime: os.uptime(),
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`Error obteniendo información del sistema: ${error.message}`)
    }
  }

  async getSystemStatus() {
    try {
      const [currentLoad, memory, cpuTemp, processes] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.cpuTemperature(),
        si.processes()
      ])

      return {
        cpu_usage: currentLoad.currentLoad,
        memory_usage: (memory.used / memory.total) * 100,
        cpu_temperature: cpuTemp.main || null,
        running_processes: processes.all,
        running_processes_names: processes.list.slice(0, 10).map(p => p.name),
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`Error obteniendo estado del sistema: ${error.message}`)
    }
  }

  async getWindowsSpecificInfo() {
    const commands = {
      build: '(Get-WmiObject -Class Win32_OperatingSystem).BuildNumber',
      domain: '(Get-WmiObject -Class Win32_ComputerSystem).Domain',
      workgroup: '(Get-WmiObject -Class Win32_ComputerSystem).Workgroup',
      joinedDomain: '(Get-WmiObject -Class Win32_ComputerSystem).PartOfDomain',
      powerShellVersion: '$PSVersionTable.PSVersion.ToString()',
      lastBoot: '(Get-CimInstance -ClassName Win32_OperatingSystem).LastBootUpTime',
      antivirus: 'Get-MpComputerStatus | Select-Object AntivirusEnabled',
      firewall: 'Get-NetFirewallProfile | Select-Object Name, Enabled'
    }

    const results = {}
    
    for (const [key, command] of Object.entries(commands)) {
      try {
        const { stdout } = await execAsync(`powershell -Command "${command}"`, { 
          encoding: 'utf8',
          timeout: 10000 
        })
        results[key] = stdout.trim()
      } catch (error) {
        results[key] = null
      }
    }

    // Obtener versiones de .NET
    try {
      const { stdout } = await execAsync('dir /b %windir%\\Microsoft.NET\\Framework\\v*', { encoding: 'utf8' })
      results.dotNetVersions = stdout.split('\n').filter(v => v.trim()).map(v => `v${v.replace('v', '')}`)
    } catch (error) {
      results.dotNetVersions = []
    }

    // Información de Windows Update
    try {
      const { stdout } = await execAsync('powershell -Command "(Get-HotFix | Sort-Object -Property InstalledOn -Descending | Select-Object -First 1).InstalledOn"')
      results.windowsUpdate = stdout.trim()
    } catch (error) {
      results.windowsUpdate = null
    }

    return results
  }

  async getInstalledSoftware() {
    try {
      const { stdout } = await execAsync('powershell -Command "Get-WmiObject -Class Win32_Product | Select-Object Name, Version, Vendor"')
      return stdout
    } catch (error) {
      throw new Error(`Error obteniendo software instalado: ${error.message}`)
    }
  }

  async getRunningServices() {
    try {
      const { stdout } = await execAsync('powershell -Command "Get-Service | Where-Object {$_.Status -eq \"Running\"} | Select-Object Name, DisplayName"')
      return stdout
    } catch (error) {
      throw new Error(`Error obteniendo servicios: ${error.message}`)
    }
  }

  async getWindowsEvents(logName = 'System', maxEvents = 10) {
    try {
      const { stdout } = await execAsync(`powershell -Command "Get-EventLog -LogName ${logName} -Newest ${maxEvents} | Select-Object TimeGenerated, EntryType, Source, Message | ConvertTo-Json"`)
      return JSON.parse(stdout)
    } catch (error) {
      throw new Error(`Error obteniendo eventos de Windows: ${error.message}`)
    }
  }

  async getRegistryKeys(path = 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion') {
    try {
      const { stdout } = await execAsync(`powershell -Command "Get-Item -Path '${path}' | ConvertTo-Json"`)
      return JSON.parse(stdout)
    } catch (error) {
      throw new Error(`Error obteniendo claves de registro: ${error.message}`)
    }
  }
}