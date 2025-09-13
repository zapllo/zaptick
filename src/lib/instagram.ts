interface InstagramAPIResponse {
  data?: any;
  error?: {
    message: string;
    code: number;
    error_subcode?: number;
  };
}

interface InstagramMessage {
  id: string;
  created_time: string;
  message?: string;
  from: {
    username: string;
    id: string;
  };
  attachments?: {
    data: {
      image_data?: {
        url: string;
        preview_url: string;
      };
      video_data?: {
        url: string;
        preview_url: string;
      };
    }[];
  };
}

export class InstagramService {
  private static readonly BASE_URL = 'https://graph.facebook.com/v18.0';

  /**
   * Get Instagram Business Account info
   */
  static async getBusinessAccount(pageAccessToken: string, pageId: string) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/${pageId}?fields=instagram_business_account{id,username,name,biography,website,followers_count,media_count,profile_picture_url}&access_token=${pageAccessToken}`
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return {
        success: true,
        account: data.instagram_business_account
      };
    } catch (error) {
      console.error('Error fetching Instagram business account:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get Instagram conversations (message threads)
   */
  static async getConversations(instagramBusinessId: string, accessToken: string) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/${instagramBusinessId}/conversations?platform=instagram&access_token=${accessToken}`
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return {
        success: true,
        conversations: data.data || []
      };
    } catch (error) {
      console.error('Error fetching Instagram conversations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get messages from a specific conversation
   */
  static async getMessages(conversationId: string, accessToken: string) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/${conversationId}/messages?fields=id,created_time,message,from,to,attachments{type,image_data,video_data}&access_token=${accessToken}`
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return {
        success: true,
        messages: data.data || []
      };
    } catch (error) {
      console.error('Error fetching Instagram messages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send a direct message
   */
  static async sendMessage(
    instagramBusinessId: string,
    recipientId: string,
    message: string,
    accessToken: string
  ) {
    try {
      const payload = {
        recipient: {
          id: recipientId
        },
        message: {
          text: message
        }
      };

      const response = await fetch(
        `${this.BASE_URL}/${instagramBusinessId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...payload,
            access_token: accessToken
          })
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return {
        success: true,
        messageId: data.message_id
      };
    } catch (error) {
      console.error('Error sending Instagram message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get media comments
   */
  static async getMediaComments(mediaId: string, accessToken: string) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/${mediaId}/comments?fields=id,text,username,timestamp,like_count,replies{id,text,username,timestamp}&access_token=${accessToken}`
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return {
        success: true,
        comments: data.data || []
      };
    } catch (error) {
      console.error('Error fetching media comments:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Reply to a comment
   */
  static async replyToComment(
    commentId: string,
    replyText: string,
    accessToken: string
  ) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/${commentId}/replies`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: replyText,
            access_token: accessToken
          })
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return {
        success: true,
        replyId: data.id
      };
    } catch (error) {
      console.error('Error replying to comment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Hide/unhide a comment
   */
  static async hideComment(commentId: string, hide: boolean, accessToken: string) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/${commentId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            hide: hide,
            access_token: accessToken
          })
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return {
        success: true,
        result: data.success || false
      };
    } catch (error) {
      console.error('Error hiding/showing comment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get recent media posts
   */
  static async getRecentMedia(instagramBusinessId: string, accessToken: string, limit = 25) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/${instagramBusinessId}/media?fields=id,media_type,media_url,permalink,caption,timestamp,comments_count,like_count&limit=${limit}&access_token=${accessToken}`
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return {
        success: true,
        media: data.data || []
      };
    } catch (error) {
      console.error('Error fetching recent media:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user profile info
   */
  static async getUserProfile(userId: string, accessToken: string) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/${userId}?fields=username,account_type,media_count,followers_count,follows_count,profile_picture_url&access_token=${accessToken}`
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return {
        success: true,
        profile: data
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}