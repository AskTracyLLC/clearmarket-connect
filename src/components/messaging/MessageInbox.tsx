import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MessageSquare, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserInitials: string;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    otherUserId: "user-1",
    otherUserName: "Tom Martinez",
    otherUserInitials: "T.M.",
    unreadCount: 2,
    lastMessage: {
      id: "msg-1",
      senderId: "user-1",
      senderName: "Tom Martinez", 
      senderInitials: "T.M.",
      content: "I'm available for inspections in your area this week. What's your standard rate?",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false
    },
    messages: [
      {
        id: "msg-1",
        senderId: "user-1",
        senderName: "Tom Martinez",
        senderInitials: "T.M.",
        content: "Hi, I saw your profile and would like to connect regarding property inspections in the Atlanta area.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: true
      },
      {
        id: "msg-2",
        senderId: "current-user",
        senderName: "You",
        senderInitials: "YOU",
        content: "Thanks for reaching out! I have availability this week. What type of inspections are you looking for?",
        timestamp: new Date(Date.now() - 90 * 60 * 1000), // 90 minutes ago
        read: true
      },
      {
        id: "msg-3",
        senderId: "user-1",
        senderName: "Tom Martinez",
        senderInitials: "T.M.",
        content: "I'm available for inspections in your area this week. What's your standard rate?",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false
      }
    ]
  }
];

const MessageInbox = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = mockConversations.filter(conv =>
    conv.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // In a real app, this would send the message to the backend
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  const formatMessageTime = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / (24 * 60))}d ago`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>{conversation.otherUserInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{conversation.otherUserName}</h4>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.content}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(conversation.lastMessage.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b border-border">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{selectedConversation.otherUserInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{selectedConversation.otherUserName}</h3>
                      <p className="text-sm text-muted-foreground">Field Rep • Atlanta, GA</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderId === 'current-user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {formatMessageTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[40px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                      className="self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a conversation from the left to start messaging
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MessageInbox;