<script setup>
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
   <div class="app">
      <nav class="navigation">
         <RouterLink to="/setting">Settings</RouterLink>
         <RouterLink to="/add-and-sub">Practice</RouterLink>
      </nav>
      <main>
         <RouterView />
      </main>
   </div>
</template>

<style scoped>
.app {
   min-height: 100vh;
   font-family: Avenir, Helvetica, Arial, sans-serif;
}

.navigation {
   padding: 1em;
   background-color: #f8f9fa;
   border-bottom: 1px solid #dee2e6;
   display: flex;
   gap: 1em;
}

.navigation a {
   color: #2c3e50;
   text-decoration: none;
   padding: 0.5em 1em;
   border-radius: 4px;
   transition: background-color 0.3s;
}

.navigation a:hover,
.navigation a.router-link-active {
   background-color: #e9ecef;
}

main {
   padding: 2em;
}
</style>
