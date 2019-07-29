<style lang="scss" scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
  .modal-wrapper {
    display: table-cell;
    vertical-align: middle;
    .modal-container {
      width: 300px;
      margin: 0px auto;
      padding: 20px 30px;
      background-color: #3E3D42;
      border-radius: 2px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
      transition: all 0.3s ease;
      font-family: "Cerebri Sans", Arial, sans-serif;
      .modal-header {
        margin-top: 0;
        color: #5b4ade;
      }
      .modal-body {
        margin: 20px 0;
      }

      .modal-default-button {
        display: flex;
        justify-content: center;

        margin: 0 0.5rem;

        min-width: 100px;
        height: 38px;

        border: none;
        border-radius: 3px;

        color: #ffffff;
        font-size: 13px;
        font-weight: 300;
        font-family: "Cerebri Sans", Arial, sans-serif;
        letter-spacing: 0;

        cursor: pointer;
        text-align: center;
        transition: background 250ms ease-in-out, transform 150ms ease;
        -webkit-appearance: none;
        -moz-appearance: none;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        .btn-primary {
          background-color: #5b4ade;
          color: #ffffff;
        }
      }
    }
  }
}
</style>

<template>
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
            </slot>
          </div>

          <div class="modal-body">
            <slot name="body">
              This will delete your node's folder and all its files. Are you sure?
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              <button class="modal-default-button" @click="onCancel">
                Close
              </button>
              <button class="modal-default-button btn-primary" @click="onConfirm">
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
module.exports = {
  data() {
    return {};
  },
  methods: {
    onConfirm() {
      this.$emit("confirm");
    },
    onCancel() {
      this.$emit("close");
    }
  }
};
</script>
