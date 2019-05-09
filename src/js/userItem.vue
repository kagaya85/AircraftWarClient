<template>
    <li class="user-item">
        {{username}}
    </li>
</template>

<style>

</style>

<script>
export default {
    name: 'userItem',
    props: ['username']  
}
</script>
