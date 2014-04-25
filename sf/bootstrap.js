'use strict';

var dojoConfig = {
        baseUrl:        '.'
      , async:          1
      , hasCache:       { 'host-node': 1
                        , 'dom': 0
                        }
      , packages:       [ { name: 'dojo'
                          , location: 'dojo'
                          }
                        , { name: 'sf'
                          , location: '.'
                          }
                        ]
};

require('./dojo/dojo.js');
