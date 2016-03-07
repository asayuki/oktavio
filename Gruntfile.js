module.exports = function(grunt) {
  grunt.initConfig({
    // While we wait for ES6-support in uglify
    //uglify: {
    //  my_target: {
    //    files: [
    //      {
    //        'core/ui/statics/js/minified-vendors.js': [
    //          'core/ui/_assets/javascript/core/network.js',
    //        ]
    //      },
    //      grunt.file.expandMapping(['core/ui/_assets/javascript/modules/**/*.js'], 'core/ui/statics/js/', {
    //        rename: function(destBase, destPath) {
    //          return destBase+destPath.replace('core/ui/_assets/javascript/', '');
    //        }
    //      })
    //    ]
    //  }
    //},
    concat: {
      dist: {
        files: {
          'core/ui/statics/js/minified-core.js': [
            'core/ui/_assets/javascript/core/network.js'
          ]
        },
      },
    },
    copy: {
      files: {
        cwd: 'core/ui/_assets/javascript/modules',  // set working folder / root to copy
        src: '**/*.js',           // copy all files and subfolders
        dest: 'core/ui/statics/js/modules',    // destination folder
        expand: true           // required when using cwd
      }
    },
    // End of waiting
    sass: {
      dist: {
        options: {
          style: 'compact',
          sourcemap: 'none'
        },
        files: {
          'core/ui/statics/css/style.css': 'core/ui/_assets/scss/style.scss'
        }
      }
    },
    watch: {
      css: {
        files: ['core/ui/_assets/scss/**/*.scss', 'core/ui/_assets/javascript/**/*.js'],
        //tasks: ['sass', 'uglify']
        tasks: ['sass', 'concat', 'copy']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // While we wait for ES6-support in uglify
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.registerTask('dev', ['sass', 'uglify', 'watch']);

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('dev', ['sass', 'concat', 'copy', 'watch']);
};
