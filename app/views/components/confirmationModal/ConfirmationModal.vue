<style lang="sass" scoped>
.appear-enter {
     opacity: 0;
    .modal-window {
     transform: translate(-75%, -50%);
    }
}
    
.appear-enter-active {
     transition: .5s;
     .modal-window {
     transform: translate(-75%, -50%);
    }
}
    
.appear-leave-active {
     opacity: 0;
     transition: .5s;
     .modal-window {
     transform: translate(0, -50%);
    }
}
</style>

<template>
	<b-modal v-model="modalShow"
             hide-footer
			 hide-header 
			 title="Using Component Methods">
      <div class="d-block text-center">
        <h3>Hello From My Modal!</h3>
      </div>
      <b-btn class="mt-3" variant="outline-danger" block @click="onCancel">Cancel</b-btn>
      <b-btn class="mt-3" variant="outline-danger" block @click="onDelete">Delete</b-btn>
    </b-modal>
</template>

<script>
export default {
  data: function() {
      return {
          modalShow: this.modalShow
      }
  },
  props: ["modalShow"],
  methods: {
    onDelete: function() {
      this.$emit("confirm");
    },
    onCancel: function() {
      modalShow = !modalShow;
    }
  }
};
</script>