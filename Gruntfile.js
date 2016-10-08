'use strict';
module.exports = (grunt) => {
  grunt.initConfig({
    sass: {
      dist: {
        options: {
          'style': 'compact',
          'sourcemap': 'none'
        },
        files: {
          'core/ui/statics/style.css': 'core/ui/assets/sccs/style.scss'
        }
      }
    },

    watch: {
      css: {
        files: ['core/ui/assets/**/*.scss'],
        tasks: ['sass']
      }
    }
  });

  grunt.loadNpmTask('grunt-contrib-sass');
  grunt.loadNpmTask('grunt-contrib-watch');

  grunt.registerTask('dev', ['sass', 'watch']);
};
