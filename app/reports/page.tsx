'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Header } from '@/components/header'
import { Download, Eye, ChevronDown } from 'lucide-react'

interface Report {
  id: string
  name: string
  type: string
  description: string
  date: string
  format: string
  size: string
  status: 'completed' | 'generating' | 'scheduled'
}

const mockReports: Report[] = [
  {
    id: '1',
    name: 'Q2 2024 Revenue Report',
    type: 'Financial',
    description: 'Comprehensive revenue analysis for Q2 2024 including all sales channels',
    date: '2024-07-14',
    format: 'PDF',
    size: '2.4 MB',
    status: 'completed',
  },
  {
    id: '2',
    name: 'Inventory Status Report',
    type: 'Inventory',
    description: 'Current inventory levels, stock alerts, and restocking recommendations',
    date: '2024-07-14',
    format: 'Excel',
    size: '1.1 MB',
    status: 'completed',
  },
  {
    id: '3',
    name: 'Customer Satisfaction Survey',
    type: 'Customer',
    description: 'Latest customer feedback and satisfaction metrics from surveys',
    date: '2024-07-13',
    format: 'PDF',
    size: '3.2 MB',
    status: 'completed',
  },
  {
    id: '4',
    name: 'Sales Performance Analysis',
    type: 'Sales',
    description: 'Top performing products and regions, sales forecasts for next quarter',
    date: '2024-07-12',
    format: 'Excel',
    size: '1.8 MB',
    status: 'completed',
  },
  {
    id: '5',
    name: 'June Monthly Report',
    type: 'Monthly',
    description: 'Complete monthly summary report for June 2024',
    date: '2024-07-01',
    format: 'PDF',
    size: '4.1 MB',
    status: 'completed',
  },
]

const reportTypes = [
  { label: 'All Reports', value: 'all' },
  { label: 'Financial', value: 'Financial' },
  { label: 'Sales', value: 'Sales' },
  { label: 'Inventory', value: 'Inventory' },
  { label: 'Customer', value: 'Customer' },
  { label: 'Monthly', value: 'Monthly' },
]

export default function ReportsPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [reportType, setReportType] = useState('all')

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) {
      router.push('/login')
    } else {
      setIsAuthed(true)
    }
  }, [router])

  if (!isAuthed) return null

  const filteredReports = mockReports.filter((report) =>
    reportType === 'all' ? true : report.type === reportType
  )

  return (
    <LayoutWrapper>
      <Header title="Reports" subtitle="Generate and manage business reports" />

      <div className="p-8 space-y-8">
        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative min-w-48">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a1a] hairline text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c] appearance-none cursor-pointer"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#a8a8a8]" />
          </div>
          <button className="px-6 py-3 bg-[#c89b5c] text-[#0a0a0a] font-medium rounded-none hover:bg-[#e8c989] transition-colors">
            Generate New Report
          </button>
        </div>

        {/* Report Templates */}
        <div>
          <h3 className="text-subheading text-foreground mb-4">Report Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Monthly Summary', icon: '📊', desc: 'Complete monthly overview' },
              { name: 'Quarterly Analysis', icon: '📈', desc: 'Quarterly performance report' },
              { name: 'Inventory Check', icon: '📦', desc: 'Stock levels and trends' },
              { name: 'Sales Report', icon: '💰', desc: 'Revenue and sales metrics' },
              { name: 'Customer Insights', icon: '👥', desc: 'Customer behavior analysis' },
              { name: 'Custom Report', icon: '⚙️', desc: 'Build your own report' },
            ].map((template, i) => (
              <button
                key={i}
                className="bg-[#1a1a1a] hairline p-6 hover:bg-[#242424] transition-colors text-left rounded-none"
              >
                <div className="text-3xl mb-3">{template.icon}</div>
                <h4 className="text-body font-medium text-foreground">{template.name}</h4>
                <p className="text-body-small text-[#a8a8a8] mt-1">{template.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <h3 className="text-subheading text-foreground mb-4">Recent Reports</h3>
          <div className="bg-[#1a1a1a] hairline overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b hairline-subtle bg-[#0a0a0a]">
                    <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Report Name</th>
                    <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Type</th>
                    <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Generated</th>
                    <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Format</th>
                    <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Size</th>
                    <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-[#111111] transition-colors">
                      <td className="px-6 py-4 text-body-small text-foreground font-medium">{report.name}</td>
                      <td className="px-6 py-4 text-body-small text-[#a8a8a8]">{report.type}</td>
                      <td className="px-6 py-4 text-body-small text-[#a8a8a8]">{report.date}</td>
                      <td className="px-6 py-4 text-body-small text-foreground font-medium">{report.format}</td>
                      <td className="px-6 py-4 text-body-small text-[#707070]">{report.size}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-body-small font-medium rounded-none ${
                            report.status === 'completed'
                              ? 'bg-[#1a2a18] text-[#6b9e5f]'
                              : report.status === 'generating'
                                ? 'bg-[#1b2429] text-[#7c9cb4]'
                                : 'bg-[#2a2218] text-[#d4a574]'
                          }`}
                        >
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button className="p-2 hover:bg-[#2a2a2a] rounded-none transition-colors">
                          <Eye className="w-4 h-4 text-[#a8a8a8] hover:text-[#c89b5c]" />
                        </button>
                        <button className="p-2 hover:bg-[#2a2a2a] rounded-none transition-colors">
                          <Download className="w-4 h-4 text-[#a8a8a8] hover:text-[#c89b5c]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Report Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a] hairline p-6">
            <h3 className="text-subheading text-foreground mb-4">Scheduled Reports</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b hairline-subtle">
                <span className="text-body-small text-foreground">Weekly Sales Report</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-6 bg-[#2a2a2a] peer-focus:outline-none rounded-none peer-checked:bg-[#c89b5c] transition-colors" />
                  <span className="ml-3 text-body-small text-[#a8a8a8]">Every Monday</span>
                </label>
              </div>
              <div className="flex items-center justify-between pb-3 border-b hairline-subtle">
                <span className="text-body-small text-foreground">Monthly Summary</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-6 bg-[#2a2a2a] peer-focus:outline-none rounded-none peer-checked:bg-[#c89b5c] transition-colors" />
                  <span className="ml-3 text-body-small text-[#a8a8a8]">1st of month</span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-small text-foreground">Inventory Alert</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-10 h-6 bg-[#2a2a2a] peer-focus:outline-none rounded-none peer-checked:bg-[#c89b5c] transition-colors" />
                  <span className="ml-3 text-body-small text-[#a8a8a8]">Disabled</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] hairline p-6">
            <h3 className="text-subheading text-foreground mb-4">Export Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-body-small text-foreground block mb-2">Default Format</label>
                <select className="w-full px-4 py-2 bg-[#0a0a0a] hairline text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c]">
                  <option>PDF</option>
                  <option>Excel</option>
                  <option>CSV</option>
                </select>
              </div>
              <div>
                <label className="text-body-small text-foreground block mb-2">Export Recipients</label>
                <input
                  type="email"
                  placeholder="admin@leoworld.com"
                  className="w-full px-4 py-2 bg-[#0a0a0a] hairline text-foreground placeholder-[#707070] rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c]"
                />
              </div>
              <button className="w-full px-4 py-2 bg-[#c89b5c] text-[#0a0a0a] font-medium rounded-none hover:bg-[#e8c989] transition-colors">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
