"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Edit, Plus, Trash2, UserPlus, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Role {
  id: string
  name: string
  description: string | null
}

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  role_id: string | null
  status: string
  roles?: { name: string } | null
}

interface TeamManagementProps {
  roles: Role[]
  teamMembers: TeamMember[]
  userId: string
}

export default function TeamManagement({ roles, teamMembers, userId }: TeamManagementProps) {
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [roleName, setRoleName] = useState("")
  const [roleDescription, setRoleDescription] = useState("")
  const [memberEmail, setMemberEmail] = useState("")
  const [memberName, setMemberName] = useState("")
  const [memberRoleId, setMemberRoleId] = useState("")
  const [memberStatus, setMemberStatus] = useState("active")
  const router = useRouter()

  const openRoleDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setRoleName(role.name)
      setRoleDescription(role.description || "")
    } else {
      setEditingRole(null)
      setRoleName("")
      setRoleDescription("")
    }
    setIsRoleDialogOpen(true)
  }

  const openMemberDialog = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member)
      setMemberEmail(member.email)
      setMemberName(member.full_name || "")
      setMemberRoleId(member.role_id || "")
      setMemberStatus(member.status)
    } else {
      setEditingMember(null)
      setMemberEmail("")
      setMemberName("")
      setMemberRoleId("")
      setMemberStatus("active")
    }
    setIsMemberDialogOpen(true)
  }

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const roleData = {
      user_id: userId,
      name: roleName,
      description: roleDescription || null,
    }

    if (editingRole) {
      await supabase.from("roles").update(roleData).eq("id", editingRole.id)
    } else {
      await supabase.from("roles").insert(roleData)
    }

    setIsRoleDialogOpen(false)
    router.refresh()
  }

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const memberData = {
      manager_id: userId,
      email: memberEmail,
      full_name: memberName || null,
      role_id: memberRoleId || null,
      status: memberStatus,
    }

    if (editingMember) {
      await supabase.from("team_members").update(memberData).eq("id", editingMember.id)
    } else {
      await supabase.from("team_members").insert(memberData)
    }

    setIsMemberDialogOpen(false)
    router.refresh()
  }

  const handleDeleteRole = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return
    const supabase = createClient()
    await supabase.from("roles").delete().eq("id", id)
    router.refresh()
  }

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return
    const supabase = createClient()
    await supabase.from("team_members").delete().eq("id", id)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="members" className="text-xs sm:text-sm">Team Members</TabsTrigger>
          <TabsTrigger value="roles" className="text-xs sm:text-sm">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span className="truncate">Team Members</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Manage your team members and assign them roles</CardDescription>
                </div>
                <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openMemberDialog()} className="w-full sm:w-auto">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] sm:w-full">
                    <DialogHeader>
                      <DialogTitle>{editingMember ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
                      <DialogDescription>
                        {editingMember
                          ? "Update team member information"
                          : "Add a new team member to assign tasks to"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMemberSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="member-email">Email *</Label>
                        <Input
                          id="member-email"
                          type="email"
                          required
                          value={memberEmail}
                          onChange={(e) => setMemberEmail(e.target.value)}
                          placeholder="team.member@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-name">Full Name</Label>
                        <Input
                          id="member-name"
                          value={memberName}
                          onChange={(e) => setMemberName(e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-role">Role</Label>
                        <Select value={memberRoleId} onValueChange={setMemberRoleId}>
                          <SelectTrigger id="member-role">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No Role</SelectItem>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-status">Status</Label>
                        <Select value={memberStatus} onValueChange={setMemberStatus}>
                          <SelectTrigger id="member-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsMemberDialogOpen(false)}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="w-full sm:w-auto">{editingMember ? "Update" : "Add"} Member</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">No team members yet</p>
                  <Button onClick={() => openMemberDialog()}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Your First Team Member
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-secondary/50 transition-colors gap-3 sm:gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm sm:text-base truncate">{member.full_name || member.email}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{member.email}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {member.roles?.name && (
                              <Badge variant="secondary" className="text-xs sm:text-sm">{member.roles.name}</Badge>
                            )}
                            <Badge variant={member.status === "active" ? "default" : "outline"} className="text-xs sm:text-sm">
                              {member.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openMemberDialog(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span className="truncate">Roles</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Define roles for your team members</CardDescription>
                </div>
                <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openRoleDialog()} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] sm:w-full">
                    <DialogHeader>
                      <DialogTitle>{editingRole ? "Edit Role" : "Add Role"}</DialogTitle>
                      <DialogDescription>
                        {editingRole ? "Update role information" : "Create a new role for your team"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRoleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="role-name">Role Name *</Label>
                        <Input
                          id="role-name"
                          required
                          value={roleName}
                          onChange={(e) => setRoleName(e.target.value)}
                          placeholder="e.g., Developer, Designer, Manager"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role-description">Description</Label>
                        <Textarea
                          id="role-description"
                          value={roleDescription}
                          onChange={(e) => setRoleDescription(e.target.value)}
                          placeholder="Describe the responsibilities of this role"
                          rows={3}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsRoleDialogOpen(false)}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="w-full sm:w-auto">{editingRole ? "Update" : "Create"} Role</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {roles.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">No roles defined yet</p>
                  <Button onClick={() => openRoleDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Role
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-secondary/50 transition-colors gap-3 sm:gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 text-sm sm:text-base">{role.name}</h3>
                        {role.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground">{role.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRoleDialog(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

