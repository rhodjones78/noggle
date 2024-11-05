<script>
  import { goto } from "$app/navigation";
  
  export let data;
  
  let businessTypes = [
    "Retail",
    "Restaurant",
    "Service",
    "Technology",
    "Manufacturing",
    "Other"
  ];

  let formData = {
    name: "",
    address: "",
    type: businessTypes[0],
    description: ""
  };

  let error = null;
  let loading = false;

  async function handleSubmit() {
    try {
      loading = true;
      error = null;

      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create business');
      }

      await goto('/businesses');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex h-screen overflow-hidden bg-gray-50">
  <!-- Sidebar -->
  <div class="w-64 bg-white border-r border-gray-200 overflow-y-auto">
    <div class="p-4">
      <h2 class="text-lg font-medium text-gray-900">Your Businesses</h2>
    </div>
    <nav class="px-4 space-y-1">
      {#if data.businesses && data.businesses.length > 0}
        {#each data.businesses as business}
          <a
            href="/businesses/{business.id}"
            class="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            <div class="font-medium">{business.name}</div>
            <div class="text-xs text-gray-500">{business.type}</div>
          </a>
        {/each}
      {:else}
        <p class="text-sm text-gray-500 px-3 py-2">No businesses yet</p>
      {/if}
    </nav>
  </div>

  <!-- Main content -->
  <div class="flex-1 overflow-y-auto">
    <div class="max-w-2xl mx-auto px-4 py-8">
      <div class="bg-white shadow-lg rounded-lg p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Create New Business</h1>
        
        {#if error}
          <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{error}</p>
          </div>
        {/if}
        
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Business Name</label>
              <input
                type="text"
                id="name"
                bind:value={formData.name}
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-sm"
                required
              />
            </div>
            <div>
              <label for="type" class="block text-sm font-medium text-gray-700">Business Type</label>
              <select
                id="type"
                bind:value={formData.type}
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-sm"
              >
                {#each businessTypes as type}
                  <option value={type}>{type}</option>
                {/each}
              </select>
            </div>
          </div>

          <div>
            <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              id="address"
              bind:value={formData.address}
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-sm"
              required
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              bind:value={formData.description}
              rows="3"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-sm"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Business'}
          </button>
        </form>
      </div>
    </div>
  </div>
</div>