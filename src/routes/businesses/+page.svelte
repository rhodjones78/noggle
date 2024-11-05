<script>
  export let data;
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="md:flex md:items-center md:justify-between mb-6">
    <div class="flex-1 min-w-0">
      <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
        Your Businesses
      </h2>
    </div>
    <div class="mt-4 flex md:mt-0 md:ml-4">
      <a
        href="/"
        class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Add New Business
      </a>
    </div>
  </div>

  {#if data.businesses && data.businesses.length > 0}
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each data.businesses as business}
        <div class="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900">{business.name}</h3>
            <p class="mt-1 text-sm text-gray-500">{business.type}</p>
            <p class="mt-2 text-sm text-gray-500">{business.description}</p>
          </div>
          <div class="px-4 py-4 sm:px-6">
            <a
              href="/businesses/{business.id}"
              class="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Manage Business <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-center py-12">
      <h3 class="mt-2 text-sm font-medium text-gray-900">No businesses yet</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new business.</p>
      <div class="mt-6">
        <a
          href="/"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Business
        </a>
      </div>
    </div>
  {/if}
</div>