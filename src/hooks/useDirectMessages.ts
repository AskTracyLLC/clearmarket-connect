import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: string;
  sent_at: string;
  read_at: string | null;
  responded_at: string | null;
  is_system_message: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
  sender?: {
    display_name: string | null;
    anonymous_username: string;
    role: string;
  };
  recipient?: {
    display_name: string | null;
    anonymous_username: string;
    role: string;
  };
}

export interface Conversation {
  conversation_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_role: string;
  last_message: DirectMessage;
  unread_count: number;
  messages: DirectMessage[];
}

export const useDirectMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get all messages involving the current user
      const { data: messages, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:sender_id(display_name, anonymous_username, role),
          recipient:recipient_id(display_name, anonymous_username, role)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('sent_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation
      const conversationMap = new Map<string, Conversation>();

      messages?.forEach((message: any) => {
        const isFromCurrentUser = message.sender_id === user.id;
        const otherUser = isFromCurrentUser ? message.recipient : message.sender;
        const otherUserId = isFromCurrentUser ? message.recipient_id : message.sender_id;

        if (!conversationMap.has(message.conversation_id)) {
          conversationMap.set(message.conversation_id, {
            conversation_id: message.conversation_id,
            other_user_id: otherUserId,
            other_user_name: otherUser?.display_name || otherUser?.anonymous_username || 'Unknown User',
            other_user_role: otherUser?.role || 'field_rep',
            last_message: message,
            unread_count: 0,
            messages: []
          });
        }

        const conversation = conversationMap.get(message.conversation_id)!;
        conversation.messages.push(message);

        // Count unread messages (messages sent to current user that haven't been read)
        if (message.recipient_id === user.id && !message.read_at) {
          conversation.unread_count++;
        }
      });

      // Sort messages within each conversation
      conversationMap.forEach(conversation => {
        conversation.messages.sort((a, b) => 
          new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
        );
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (
    recipientId: string,
    content: string,
    conversationId?: string
  ): Promise<boolean> => {
    if (!user || !content.trim()) return false;

    try {
      const messageConversationId = conversationId || `${user.id}-${recipientId}`;

      const { data: newMessage, error } = await supabase
        .from('direct_messages')
        .insert({
          conversation_id: messageConversationId,
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim(),
          message_type: 'text'
        })
        .select(`
          *,
          sender:sender_id(display_name, anonymous_username, role),
          recipient:recipient_id(display_name, anonymous_username, role)
        `)
        .single();

      if (error) throw error;

      // Check if this is a response to a previous message and mark it
      const { data: previousMessages } = await supabase
        .from('direct_messages')
        .select('id')
        .eq('conversation_id', messageConversationId)
        .eq('sender_id', recipientId)
        .eq('recipient_id', user.id)
        .is('responded_at', null)
        .order('sent_at', { ascending: false })
        .limit(1);

      if (previousMessages && previousMessages.length > 0) {
        await supabase.rpc('mark_message_responded', {
          message_id: previousMessages[0].id,
          responder_user_id: user.id
        });
      }

      await fetchConversations();
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  const markAsRead = async (messageId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_id', user.id);

      if (error) throw error;

      await fetchConversations();
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  };

  const markConversationAsRead = async (conversationId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id)
        .is('read_at', null);

      if (error) throw error;

      await fetchConversations();
      return true;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      return false;
    }
  };

  const getUnreadCount = (): number => {
    return conversations.reduce((total, conv) => total + conv.unread_count, 0);
  };

  useEffect(() => {
    fetchConversations();

    // Set up real-time subscription for new messages
    if (user) {
      const channel = supabase
        .channel('direct_messages_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'direct_messages',
            filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`
          },
          () => {
            fetchConversations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    conversations,
    loading,
    sendMessage,
    markAsRead,
    markConversationAsRead,
    getUnreadCount,
    refetch: fetchConversations
  };
};