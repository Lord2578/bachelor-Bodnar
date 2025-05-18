import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Channel {
  name: string
  type: string
  icon: string
}

interface ChannelsGridProps {
  channels: Channel[]
}

export function ChannelsGrid({ channels }: ChannelsGridProps) {
  return (
    <div className="space-y-4 bg-white rounded-lg p-4 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Recent chats</h2>
        <Button variant="link" className="text-sm text-blue-500 shrink-0">
          View all
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 overflow-auto flex-1 max-h-[400px]">
        {channels.map((channel) => (
          <Card key={channel.name} className="border border-gray-100 hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-3">
              <div className="text-2xl">{channel.icon}</div>
              <div>
                <CardTitle className="text-base">{channel.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{channel.type}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

