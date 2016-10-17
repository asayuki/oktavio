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
          'core/ui/statics/style.css': 'core/ui/assets/scss/style.scss'
        }
      }
    },
    uglify: {
      options: {
        compress: false,
        beautify: true
      },
      dev: {
        files: [
          {
            'core/ui/statics/vendors.min.js': [
              'core/ui/assets/javascript/vendor/require.min.js' // Would be best if this is last
            ]
          },
          grunt.file.expandMapping(['core/ui/statics/pages/*.js'], 'core/ui/statics/pages/', {
            flatten: true,
            rename: function(destBase, destPath) {
              return destBase+destPath;
            }
          })
        ]
      },
      production: {

      }
    },
    babel: {
      options: {
        sourceMap: false,
        presets: ['es2015']
      },
      dist: {
        files: [
          grunt.file.expandMapping(['core/ui/assets/javascript/pages/*.js'], 'core/ui/statics/pages/', {
            flatten: true,
            rename: function(destBase, destPath) {
              return destBase+destPath.replace('.js', '.min.js');
            }
          })
        ]
      }
    },
    watch: {
      css: {
        files: ['core/ui/assets/**/*.scss'],
        tasks: ['sass']
      },
      js: {
        files: ['core/ui/assets/**/*.js'],
        tasks: ['babel', 'uglify:dev']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-babel');

  grunt.registerTask('dev', ['sass', 'babel', 'uglify:dev', 'watch']);
};
