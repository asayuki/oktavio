module.exports = (grunt) => {
  grunt.initConfig({
    /**
     * SASS to CSS
     */
    sass: {
      dist: {
        options: {
          style: 'compact',
          sourcemap: 'none'
        },
        files: {
          'core/ui/statics/css/style.css': 'core/ui/assets/scss/style.scss',
          'core/ui/statics/css/styleguide.css': 'core/ui/assets/scss/styleguide.scss'
        }
      }
    },
    /**
     * Set up some watchers
     */
    watch: {
      css: {
        files: ['core/ui/assets/scss/**/*.scss'],
        tasks: ['sass']
      }
    }
  });

  /**
   * Load tasks
   */
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  /**
   * Register tasks
   */
  grunt.registerTask('dev', ['sass', 'watch']);
  grunt.registerTask('default', ['sass']);
};
