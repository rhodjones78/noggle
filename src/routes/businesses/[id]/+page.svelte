<script>
  export let data;
  const business = data.business;
  const chatTypes = data.chatTypes;

  async function startNewChat(chatType) {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: business.id,
          type: chatType.type,
          title: `New ${chatType.type.replace('_', ' ')} chat`
        })
      });

      if (response.ok) {
        const chat = await response.json();
        window.location.href = `/businesses/${business.id}/chat/${chat.id}`;
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  }
</script>

<div class="max-w-7xl mx-auto">
  <div class="md:flex md:items-center md:justify-between mb-6">
    <div class="flex-1 min-w-0">
      <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
        {business.name}
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        {business.type} • {business.address}
      </p>
    </div>
  </div>

  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {#each chatTypes as chatType}
      <div class="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 text-3xl">
              {chatType.icon}
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">{chatType.title}</h3>
              <p class="mt-1 text-sm text-gray-500">{chatType.description}</p>
            </div>
          </div>
        </div>
        <div class="px-4 py-4 sm:px-6">
          <button
            on:click={() => startNewChat(chatType)}
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Start New Chat
          </button>
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-8">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Chats</h3>
    {#if data.recentChats?.length}
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul class="divide-y divide-gray-200">
          {#each data.recentChats as chat}
            <li>
              <a href="/businesses/{business.id}/chat/{chat.id}" class="block hover:bg-gray-50">
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <p class="text-sm font-medium text-blue-600 truncate">{chat.title}</p>
                    </div>
                    <div class="ml-2 flex-shrink-0 flex">
                      <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {chat.chatType.title}
                      </p>
                    </div>
                  </div>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Created {new Date(chat.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {:else}
      <p class="text-gray-500">No recent chats</p>
    {/if}
  </div>
</div>