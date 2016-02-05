module.exports = function(grunt) {
  grunt.initConfig({
    sass: {
      dist: {
        options: {
          style: 'compact',
          sourcemap: 'none'
        },
        files: {
          'core/ui/css/style.css': 'core/ui/_assets/scss/style.scss'
        }
      }
    },
    watch: {
      css: {
        files: ['core/ui/_assets/scss/**/*.scss'],
        tasks: ['sass']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('dev', ['sass', 'watch']);
};
