import React from 'react';
import { Shield, Activity, AlertTriangle, Network, Database } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ThreatMap } from './ThreatMap';
import { IncidentList } from './IncidentList';
import { NetworkMonitor } from './NetworkMonitor';
import { SystemStatus } from './SystemStatus';
import { AlertPanel } from './AlertPanel';
import { ThreatDetectionPanel } from './ThreatDetectionPanel';
import { SystemAlertPanel } from './SystemAlertPanel';
import { useIncidentData } from '../hooks/useIncidentData';

export function Dashboard() {
  const { 
    incidents, 
    networkTraffic, 
    systemStatus, 
    alerts, 
    threatDetections, 
    anomalies, 
    isMonitoring, 
    toggleMonitoring 
  } = useIncidentData();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('overview');

  const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
  const highIncidents = incidents.filter(i => i.severity === 'high').length;
  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;
  const onlineSystemsCount = systemStatus.filter(s => s.status === 'online').length;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;
  const highConfidenceThreats = threatDetections.filter(t => t.confidence > 80).length;
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length;

  const stats = [
    {
      title: 'Active Threats',
      value: activeIncidents + highConfidenceThreats,
      icon: Shield,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    },
    {
      title: 'Critical Incidents',
      value: criticalIncidents + criticalAnomalies,
      icon: AlertTriangle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    {
      title: 'Systems Online',
      value: `${onlineSystemsCount}/${systemStatus.length}`,
      icon: Database,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'Network Traffic',
      value: `${networkTraffic.length}`,
      icon: Network,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    }
  ];

  const sidebarStats = {
    activeThreats: activeIncidents + highConfidenceThreats,
    criticalIncidents: criticalIncidents + criticalAnomalies,
    networkTraffic: networkTraffic.length,
    systemsOnline: `${onlineSystemsCount}/${systemStatus.length}`,
    activeAlerts: alerts.filter(a => !a.acknowledged && !a.isDuplicate).length,
    recentIncidents: incidents.length
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'threats':
        return 'Active Threats';
      case 'critical':
        return 'Critical Incidents';
      case 'network':
        return 'Network Traffic Monitor';
      case 'systems':
        return 'Systems Status';
      case 'alerts':
        return 'Active Alerts';
      case 'incidents':
        return 'Recent Incidents';
      case 'detection':
        return 'Threat Detection & Anomalies';
      default:
        return 'Dashboard Overview';
    }
  };
  const renderContent = () => {
    switch (activeSection) {
      case 'threats':
        return (
          <div className="space-y-6">
            <ThreatMap incidents={incidents} />
            <IncidentList incidents={incidents.filter(i => i.status !== 'resolved')} />
          </div>
        );
      case 'critical':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Critical Incidents Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-900/30 rounded-lg p-4">
                  <div className="text-red-400 text-2xl font-bold">{criticalIncidents}</div>
                  <div className="text-gray-400 text-sm">Critical Incidents</div>
                </div>
                <div className="bg-orange-900/30 rounded-lg p-4">
                  <div className="text-orange-400 text-2xl font-bold">{highIncidents}</div>
                  <div className="text-gray-400 text-sm">High Priority</div>
                </div>
                <div className="bg-yellow-900/30 rounded-lg p-4">
                  <div className="text-yellow-400 text-2xl font-bold">{activeIncidents}</div>
                  <div className="text-gray-400 text-sm">Total Active</div>
                </div>
              </div>
            </div>
            <IncidentList incidents={incidents.filter(i => i.severity === 'critical')} />
          </div>
        );
      case 'network':
        return (
          <div className="space-y-6">
            <NetworkMonitor networkTraffic={networkTraffic} />
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Network Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-blue-400 text-xl font-bold">
                    {networkTraffic.filter(t => t.suspicious).length}
                  </div>
                  <div className="text-gray-400 text-sm">Suspicious Connections</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-green-400 text-xl font-bold">
                    {Math.round((networkTraffic.reduce((sum, t) => sum + t.bytes, 0) / 1024 / 1024) * 100) / 100}MB
                  </div>
                  <div className="text-gray-400 text-sm">Total Data Volume</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'systems':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">System Health Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-900/30 rounded-lg p-4">
                  <div className="text-green-400 text-xl font-bold">
                    {systemStatus.filter(s => s.status === 'online').length}
                  </div>
                  <div className="text-gray-400 text-sm">Online</div>
                </div>
                <div className="bg-yellow-900/30 rounded-lg p-4">
                  <div className="text-yellow-400 text-xl font-bold">
                    {systemStatus.filter(s => s.status === 'warning').length}
                  </div>
                  <div className="text-gray-400 text-sm">Warning</div>
                </div>
                <div className="bg-red-900/30 rounded-lg p-4">
                  <div className="text-red-400 text-xl font-bold">
                    {systemStatus.filter(s => s.status === 'error').length}
                  </div>
                  <div className="text-gray-400 text-sm">Error</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-gray-400 text-xl font-bold">
                    {systemStatus.filter(s => s.status === 'offline').length}
                  </div>
                  <div className="text-gray-400 text-sm">Offline</div>
                </div>
              </div>
            </div>
            <SystemStatus systems={systemStatus} />
          </div>
        );
      case 'alerts':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Alert Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-900/30 rounded-lg p-4">
                  <div className="text-red-400 text-xl font-bold">
                    {alerts.filter(a => a.type === 'critical').length}
                  </div>
                  <div className="text-gray-400 text-sm">Critical</div>
                </div>
                <div className="bg-orange-900/30 rounded-lg p-4">
                  <div className="text-orange-400 text-xl font-bold">
                    {alerts.filter(a => a.type === 'error').length}
                  </div>
                  <div className="text-gray-400 text-sm">Error</div>
                </div>
                <div className="bg-yellow-900/30 rounded-lg p-4">
                  <div className="text-yellow-400 text-xl font-bold">
                    {alerts.filter(a => a.type === 'warning').length}
                  </div>
                  <div className="text-gray-400 text-sm">Warning</div>
                </div>
                <div className="bg-blue-900/30 rounded-lg p-4">
                  <div className="text-blue-400 text-xl font-bold">
                    {alerts.filter(a => !a.acknowledged).length}
                  </div>
                  <div className="text-gray-400 text-sm">Unacknowledged</div>
                </div>
              </div>
            </div>
            <AlertPanel alerts={alerts} />
          </div>
        );
      case 'incidents':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Incident Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-900/30 rounded-lg p-4">
                  <div className="text-red-400 text-xl font-bold">{criticalIncidents}</div>
                  <div className="text-gray-400 text-sm">Critical</div>
                </div>
                <div className="bg-orange-900/30 rounded-lg p-4">
                  <div className="text-orange-400 text-xl font-bold">{highIncidents}</div>
                  <div className="text-gray-400 text-sm">High</div>
                </div>
                <div className="bg-yellow-900/30 rounded-lg p-4">
                  <div className="text-yellow-400 text-xl font-bold">
                    {incidents.filter(i => i.severity === 'medium').length}
                  </div>
                  <div className="text-gray-400 text-sm">Medium</div>
                </div>
                <div className="bg-green-900/30 rounded-lg p-4">
                  <div className="text-green-400 text-xl font-bold">
                    {incidents.filter(i => i.status === 'resolved').length}
                  </div>
                  <div className="text-gray-400 text-sm">Resolved</div>
                </div>
              </div>
            </div>
            <IncidentList incidents={incidents} />
          </div>
        );
      case 'detection':
        return <ThreatDetectionPanel threatDetections={threatDetections} anomalies={anomalies} />;
      case 'email-alerts':
        return <SystemAlertPanel />;
      default:
        return (
          <>
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="text-center py-8">
                <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Cybersecurity Operations Center
                </h2>
                <p className="text-gray-400">
                  Real-time threat monitoring and incident response
                </p>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Advanced Detection Summary */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Shield className="h-5 w-5 text-blue-400 mr-2" />
                  Advanced Detection Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="text-red-400 text-xl font-bold">{highConfidenceThreats}</div>
                    <div className="text-gray-400 text-sm">High Confidence Threats</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="text-purple-400 text-xl font-bold">{anomalies.length}</div>
                    <div className="text-gray-400 text-sm">Anomalies Detected</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="text-blue-400 text-xl font-bold">
                      {alerts.filter(a => a.correlationId).length}
                    </div>
                    <div className="text-gray-400 text-sm">Correlated Alerts</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="text-green-400 text-xl font-bold">
                      {alerts.filter(a => a.isDuplicate).length}
                    </div>
                    <div className="text-gray-400 text-sm">Deduplicated</div>
                  </div>
                </div>
              </div>

              {/* Global Threat Map */}
              <ThreatMap incidents={incidents} />

              {/* Navigation Hint */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
                <p className="text-gray-400">
                  Use the sidebar navigation to access detailed monitoring sections including advanced threat detection
                </p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        stats={sidebarStats}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">{getSectionTitle()}</h1>
                <p className="text-sm text-gray-400">
                  Security Operations Center
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-sm text-gray-300">
                  {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
                </span>
              </div>
              <button
                onClick={toggleMonitoring}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isMonitoring 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isMonitoring ? 'Pause' : 'Resume'} Monitoring
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 px-6 py-6 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}