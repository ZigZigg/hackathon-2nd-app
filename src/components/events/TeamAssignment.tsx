"use client"

import { useState } from "react"
import { api } from "@/trpc/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"

interface TeamMember {
  id: string
  eventId: string
  userId: string | null
  collaboratorId: string | null
  role: string
  isCollaborator: boolean
}

interface TeamAssignmentProps {
  eventId: string
  teamMembers: TeamMember[]
  onUpdate?: () => void
}

export function TeamAssignment({ eventId, teamMembers, onUpdate }: TeamAssignmentProps) {
  const [showForm, setShowForm] = useState(false)
  const [userId, setUserId] = useState("")
  const [role, setRole] = useState("")
  const [isCollaborator, setIsCollaborator] = useState(false)

  const utils = api.useUtils()
  const assignMutation = api.events.assignTeam.useMutation({
    onSuccess: () => {
      void utils.events.getById.invalidate({ id: eventId })
      onUpdate?.()
      setShowForm(false)
      setUserId("")
      setRole("")
      setIsCollaborator(false)
    },
  })

  function handleAssign() {
    if (!userId.trim() || !role.trim()) return
    assignMutation.mutate({ eventId, userId, role, isCollaborator })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Team Members</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
        >
          <UserPlus className="mr-1 h-4 w-4" />
          Assign Member
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="team-userId">User ID</Label>
            <Input
              id="team-userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="User ID"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="team-role">Role</Label>
            <Input
              id="team-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Coordinator, Photographer"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="team-isCollaborator"
              type="checkbox"
              checked={isCollaborator}
              onChange={(e) => setIsCollaborator(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="team-isCollaborator">External collaborator</Label>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAssign}
              disabled={assignMutation.isPending || !userId.trim() || !role.trim()}
            >
              {assignMutation.isPending ? "Saving..." : "Assign"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {teamMembers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No team members assigned yet.</p>
      ) : (
        <ul className="space-y-2">
          {teamMembers.map((member) => (
            <li key={member.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span className="text-sm font-medium">
                {member.userId ?? member.collaboratorId ?? "Unknown"}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{member.role}</span>
                {member.isCollaborator && (
                  <Badge variant="secondary">Collaborator</Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
