'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Header } from '@/components/header'
import { ChevronDown, Edit, Trash2, Plus } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'viewer'
  department: string
  status: 'active' | 'inactive'
  joinDate: string
  lastLogin: string
}

const mockTeam: TeamMember[] = [
  {
    id: '1',
    name: 'Alexandra Smith',
    email: 'alexandra.smith@leoworld.com',
    role: 'admin',
    department: 'Operations',
    status: 'active',
    joinDate: '2024-01-15',
    lastLogin: '2024-07-14 09:23',
  },
  {
    id: '2',
    name: 'Michael Torres',
    email: 'michael.torres@leoworld.com',
    role: 'manager',
    department: 'Sales',
    status: 'active',
    joinDate: '2024-02-20',
    lastLogin: '2024-07-14 08:45',
  },
  {
    id: '3',
    name: 'Jessica Kim',
    email: 'jessica.kim@leoworld.com',
    role: 'manager',
    department: 'Inventory',
    status: 'active',
    joinDate: '2024-03-10',
    lastLogin: '2024-07-13 16:52',
  },
  {
    id: '4',
    name: 'David Chen',
    email: 'david.chen@leoworld.com',
    role: 'viewer',
    department: 'Finance',
    status: 'active',
    joinDate: '2024-04-05',
    lastLogin: '2024-07-12 14:30',
  },
  {
    id: '5',
    name: 'Emma Patterson',
    email: 'emma.patterson@leoworld.com',
    role: 'manager',
    department: 'Marketing',
    status: 'active',
    joinDate: '2024-05-01',
    lastLogin: '2024-07-11 11:15',
  },
  {
    id: '6',
    name: 'Robert Jackson',
    email: 'robert.jackson@leoworld.com',
    role: 'viewer',
    department: 'Customer Support',
    status: 'inactive',
    joinDate: '2024-06-12',
    lastLogin: '2024-06-28 09:00',
  },
]

const roleColors: Record<string, { bg: string; text: string }> = {
  admin: { bg: '#2a2218', text: '#c89b5c' },
  manager: { bg: '#1b2429', text: '#7c9cb4' },
  viewer: { bg: '#1a2a18', text: '#6b9e5f' },
}

export default function UsersPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) {
      router.push('/login')
    } else {
      setIsAuthed(true)
    }
  }, [router])

  if (!isAuthed) return null

  const filteredTeam = mockTeam.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === 'all' || member.role === filterRole

    return matchesSearch && matchesRole
  })

  const activeMembers = mockTeam.filter((m) => m.status === 'active').length

  return (
    <LayoutWrapper>
      <Header title="Users & Team" subtitle="Manage team members and permissions" />

      <div className="p-8 space-y-8">
        {/* Stats and Action */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-[#1a1a1a] hairline p-4">
              <p className="text-body-small text-[#a8a8a8]">Total Members</p>
              <p className="text-2xl font-bold text-[#c89b5c] mt-1">{mockTeam.length}</p>
            </div>
            <div className="bg-[#1a1a1a] hairline p-4">
              <p className="text-body-small text-[#a8a8a8]">Active</p>
              <p className="text-2xl font-bold text-[#6b9e5f] mt-1">{activeMembers}</p>
            </div>
            <div className="bg-[#1a1a1a] hairline p-4">
              <p className="text-body-small text-[#a8a8a8]">Admins</p>
              <p className="text-2xl font-bold text-[#7c9cb4] mt-1">{mockTeam.filter((m) => m.role === 'admin').length}</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-[#c89b5c] text-[#0a0a0a] font-medium rounded-none hover:bg-[#e8c989] transition-colors flex items-center gap-2 justify-center md:justify-start">
            <Plus className="w-4 h-4" />
            Invite Member
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#1a1a1a] hairline text-foreground placeholder-[#707070] rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c] transition-colors"
          />
          <div className="relative min-w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a1a] hairline text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c] appearance-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#a8a8a8]" />
          </div>
        </div>

        {/* Team Members Table */}
        <div className="bg-[#1a1a1a] hairline overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b hairline-subtle bg-[#0a0a0a]">
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Name</th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Email</th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Role</th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Department</th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Last Login</th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {filteredTeam.map((member) => {
                  const roleColors_ = roleColors[member.role]
                  return (
                    <tr key={member.id} className="hover:bg-[#111111] transition-colors">
                      <td className="px-6 py-4 text-body-small text-foreground font-medium">{member.name}</td>
                      <td className="px-6 py-4 text-body-small text-[#a8a8a8]">{member.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-block px-3 py-1 text-body-small font-medium rounded-none"
                          style={{ backgroundColor: roleColors_.bg, color: roleColors_.text }}
                        >
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-body-small text-foreground">{member.department}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-body-small font-medium rounded-none ${
                            member.status === 'active'
                              ? 'bg-[#1a2a18] text-[#6b9e5f]'
                              : 'bg-[#2a1a1a] text-[#a85c5c]'
                          }`}
                        >
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-body-small text-[#a8a8a8]">{member.lastLogin}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button className="p-2 hover:bg-[#2a2a2a] rounded-none transition-colors">
                          <Edit className="w-4 h-4 text-[#a8a8a8] hover:text-[#c89b5c]" />
                        </button>
                        <button className="p-2 hover:bg-[#2a2a2a] rounded-none transition-colors">
                          <Trash2 className="w-4 h-4 text-[#a8a8a8] hover:text-[#a85c5c]" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredTeam.length === 0 && (
          <div className="text-center py-12">
            <p className="text-body-small text-[#707070]">No team members found matching your criteria</p>
          </div>
        )}
      </div>
    </LayoutWrapper>
  )
}
