module.exports = {
  components: {
    'ext-a' : require('../components/external-anchor')
  },
  template: `
<footer class="footer">
  <div class="container text-center">
    <small class="mr-4"><ext-a href="https://internxt.io">Website</ext-a></small>
    <small class="mr-4"><ext-a href="t.me/internxt_io">Community</ext-a></small>
  </div>
</footer>
  `
};
