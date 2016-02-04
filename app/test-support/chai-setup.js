'use strict'

var chai = require('chai'),
    things = require('chai-things'),
    chaiAsPromised = require('chai-as-promised')
    ;

chai.use(things)
chai.use(chaiAsPromised)

chai.should()

window.expect = chai.expect