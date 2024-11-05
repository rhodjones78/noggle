<script>
  import { onMount, afterUpdate } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  export let data;

  let messages = [...data.messages];
  let inputMessage = '';
  let chatContainer;
  let business = data.business;
  let chats = data.chats || [];
  let currentChat = data.chat;
  let isProcessing = false;
  let imageGenerating = false;

  $: if (data.messages) {
    messages = [...data.messages];
    currentChat = data.chat;
    chats = data.chats || [];
  }

  $: chatTitle = currentChat?.title || 'Untitled Chat';
  $: isImageChat = currentChat?.chatType?.responseType.toLowerCase() === 'image';

  onMount(() => {
    scrollToBottom();
  });

  afterUpdate(() => {
    scrollToBottom();
  });

  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  function getMessageStyle(message) {
    switch (message.role) {
      case 'system':
        return 'hidden';
      case 'assistant':
        return isImageChat ? 'bg-white text-gray-900 p-1' : 'bg-white text-gray-900';
      case 'user':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  }

  async function sendMessage() {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      content: inputMessage,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    messages = [...messages, userMessage];
    const messageContent = inputMessage;
    inputMessage = '';
    isProcessing = true;

    if (isImageChat) {
      imageGenerating = true;
      
      const placeholderMessage = {
        id: `temp-assistant-${Date.now()}`,
        content: '',
        role: 'assistant',
        createdAt: new Date().toISOString(),
        isLoading: true
      };
      
      messages = [...messages, placeholderMessage];
    }

    try {
      const chatId = $page.params.chatId;
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: messageContent })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      if (isImageChat) {
        // Handle image response
        const data = await response.json();
        // Update the placeholder message with the actual image URL
        messages = messages.map(msg => 
          msg.isLoading ? {
            id: data.message.id,
            content: data.message.content,
            role: 'assistant',
            createdAt: new Date().toISOString(),
            isLoading: false
          } : msg
        );
        imageGenerating = false;
      } else {
        // Handle streaming text response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = {
          id: `temp-assistant-${Date.now()}`,
          content: '',
          role: 'assistant',
          createdAt: new Date().toISOString()
        };
        messages = [...messages, assistantMessage];
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const text = decoder.decode(value);
          assistantMessage.content += text;
          messages = [...messages.slice(0, -1), assistantMessage];
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      messages = messages.filter(m => m.id !== userMessage.id);
      alert('Failed to send message. Please try again.');
    } finally {
      isProcessing = false;
    }
  }

  async function switchChat(chatId) {
    try {
      const businessId = $page.params.businessId;
      await goto(`/businesses/${businessId}/chat/${chatId}`);
    } catch (error) {
      console.error('Error switching chat:', error);
    }
  }
</script>

<div class="h-[calc(100vh-110px)] flex overflow-hidden">
  <!-- Sidebar -->
  <div class="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200">
    <div class="h-16 flex items-center flex-shrink-0 px-4 border-b border-gray-200">
      <h2 class="text-lg font-medium text-gray-900 truncate">{business.name}</h2>
    </div>
    <div class="flex-1 overflow-y-auto">
      <nav class="flex-1 px-2 py-4 space-y-1">
        <div>
          <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Chat History
          </h3>
          <div class="mt-2 space-y-1">
            {#each chats as chat (chat.id)}
              <button
                on:click={() => switchChat(chat.id)}
                class="w-full text-left group flex items-center px-3 py-2 text-sm font-medium rounded-md {
                  chat.id === currentChat.id
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }"
              >
                <span class="truncate">{chat.title || `Chat ${chat.id}`}</span>
                {#if chat.chatType?.responseType === 'image'}
                  <span class="ml-2 px-1.5 py-0.5 text-xs rounded bg-purple-100 text-purple-800">IMG</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      </nav>
    </div>
  </div>

  <!-- Chat area -->
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Keep existing chat header code -->

    <!-- Messages -->
    <div bind:this={chatContainer} class="flex-1 overflow-y-auto p-4 space-y-4">
      {#each messages as message (message.id)}
        {#if message.role !== 'system'}
          <div class="flex items-start {message.role === 'assistant' ? 'justify-start' : 'justify-end'}">
            <div class="max-w-3xl {getMessageStyle(message)} rounded-lg px-4 py-2 shadow">
              {#if message.role === 'assistant' && isImageChat}
                {#if message.isLoading}
                  <div class="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span class="ml-2 text-gray-600">Generating image...</span>
                  </div>
                {:else}
                  <img 
                    src={message.content} 
                    alt="AI Generated Image" 
                    class="max-w-full rounded-lg"
                    loading="lazy"
                  />
                {/if}
              {:else}
                <p class="text-sm whitespace-pre-wrap">{message.content}</p>
              {/if}
              <p class="text-xs mt-1 {
                message.role === 'assistant'
                  ? 'text-gray-500'
                  : 'text-blue-200'
              }">
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        {/if}
      {/each}
    </div>
    
    <!-- Input area -->
    <div class="flex-shrink-0 border-t border-gray-200 p-4">
      <div class="flex space-x-3">
        <input
          type="text"
          bind:value={inputMessage}
          on:keydown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder={isImageChat ? "Describe the image you want to generate..." : "Type your message..."}
          disabled={isProcessing}
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="button"
          on:click={sendMessage}
          disabled={!inputMessage.trim() || isProcessing}
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isProcessing}
            <span class="flex items-center">
              <div class="animate-spin h-4 w-4 mr-2 border-b-2 border-white"></div>
              {isImageChat ? 'Generating...' : 'Sending...'}
            </span>
          {:else}
            {isImageChat ? 'Generate' : 'Send'}
          {/if}
        </button>
      </div>
    </div>
  </div>
</div>