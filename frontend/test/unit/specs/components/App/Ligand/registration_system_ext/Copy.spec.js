import Vue from 'vue'
import moxios from 'moxios'
import * as sinon from 'sinon'

import LigandCopy from '@/components/App/Ligand/registration_system_ext/Copy'
import VueRouter from 'vue-router'
import { HTTP } from '@/utils/http-common'
import LigandEnabledFields from '@/components/App/Ligand/LigandEnabledFields'

const sandbox = sinon.sandbox.create()

const router = new VueRouter()
describe('Ligand/Copy.vue', () => {
  let vm = null

  const DATA = {
    projectSlugOrId: 'project-1',
    ligand: {
      id: '1',
      slug: 'ligand-label',
      label: 'Ligand Label',
      tubeLabel: 'Tube label',
      concentration: '0.3',
      conceptId: 'CONCEPT1',
      solvent: 'DMSO',
      ligandEnabledFields: LigandEnabledFields.CONCEPT,
      batchId: 'G00001234.1-1'
    }
  }

  const DATA_2 = {
    projectSlugOrId: 'project-1',
    ligand: {
      label: 'Ligand Label',
      tubeLabel: 'Tube label',
      concentration: '0.3',
      conceptId: 'CONCEPT1',
      solvent: 'DMSO',
      ligandEnabledFields: LigandEnabledFields.CONCEPT,
      batchId: 'G00001234.1-1'
    }
  }

  const PROJECTS = [
    {id: 1, label: 'Project 1', ligands: [DATA.ligand]},
    {id: 2, label: 'Project 2'},
    {id: 3, label: 'Project 3'}
  ]

  beforeEach(() => {
    sandbox.stub(router, 'push')
    sandbox.stub(router, 'go')
    const Constructor = Vue.extend(LigandCopy)
    vm = new Constructor({router})

    moxios.install(HTTP)
    moxios.stubRequest(process.env.API_URL + 'ligand/' + DATA.ligand.slug, {
      status: 200,
      response: DATA.ligand
    })
    moxios.stubRequest(process.env.API_URL + 'ligand/' + DATA.ligand.slug + '/projects', {
      status: 200,
      response: PROJECTS
    })
    moxios.stubRequest(process.env.API_URL + 'project/', {
      status: 200,
      response: PROJECTS
    })
    moxios.stubRequest(process.env.API_URL + 'ligand/' + DATA.projectSlugOrId, {
      status: 200,
      response: DATA.ligand
    })
    vm.id = DATA.ligand.slug
    vm.projectId = DATA.projectSlugOrId
    sandbox.stub(vm, 'formLoadingStarted') //prevent disable save button on form mount
    vm = vm.$mount()
  })

  afterEach(() => {
    moxios.uninstall(HTTP)
    sandbox.restore()
    vm.$destroy()
    vm = null
  })

  it('should create copy ligand form have save and cancel buttons enabled', done => {
    new Promise((resolve, reject) => moxios.wait(resolve))
      .then(() => {
        expect([...vm.$el.querySelectorAll('.actions-header__buttons > button')]
          .map(x => x.textContent.trim()))
          .to.be.deep.equal(['Cancel', 'Save'])
        expect(vm.$el.querySelector('.actions-header__action-buttons__submit').disabled).to.be.eql(false)
        expect(vm.$el.querySelector('.actions-header__action-buttons__cancel').disabled).to.be.eql(false)
      }).then(done, done)
  })

  it('should create copy ligand form have defaults', done => {
    new Promise((resolve, reject) => moxios.wait(resolve))
      .then(() => {
        expect([...vm.$el.querySelectorAll('input')].map(x => x.value)).to.be.eql(['Copy of ' + DATA.ligand.label,
          '', '', DATA.ligand.tubeLabel, DATA.ligand.concentration,
          DATA.ligand.solvent])
      }).then(done, done)
  })

  describe('createLigand callback', () => {
    it('should open view form after ligand create', async () => {
      // given
      vm.projectId = DATA_2.projectSlugOrId
      vm.ligand = Object.assign({}, DATA_2.ligand)
      sandbox.stub(vm, 'loadFormData')
      const spy = sandbox.stub(vm, 'openViewForm')
      vm._service = {
        createLigand: sandbox.stub().resolves({data: DATA_2.ligand})
      }

      // when
      vm.createLigand()
      await vm.$nextTick()

      // then
      spy.should.have.been.calledOnce
      spy.should.have.been.calledWith('ligand', DATA_2.ligand)
    })

    it('should create ligand event callback execute ligand create', async () => {
      // given
      vm.projectId = DATA.projectSlugOrId
      vm.ligand = Object.assign({}, DATA.ligand)
      sandbox.stub(vm, 'loadFormData')
      sandbox.stub(vm, 'openViewForm')
      vm._service = {
        createLigand: sandbox.stub().resolves({data: DATA.ligand})
      }

      // when
      vm.createLigand()

      // then
      vm._service.createLigand.should.have.been.calledOnce
    })
  })

  describe('saveForm', () => {
    it('should send a create ligand event on save form ', async () => {
      // given
      vm.projectId = DATA.projectSlugOrId
      vm.ligand = Object.assign({}, DATA.ligand)
      sandbox.stub(vm, 'loadFormData')
      const spy = sandbox.stub(vm.$events, '$emit')
      const callback = sandbox.stub(vm, 'createLigand')

      // when
      vm.saveForm()

      // then
      spy.should.have.been.calledWith('validateAndSaveLigand', callback)
    })

    it('should not send update signal due to form validation', done => {
      Vue.nextTick().then(() => {
        vm.saveForm = sandbox.spy()
        vm.submitBaseFormBy('ligand')
        return Vue.nextTick()
      }).then(() => {
        expect(vm.saveForm).to.not.have.been.called
      }).then(done, done)
    })

    it('should cancel button execute history back', done => {
      Vue.nextTick().then(() => {
        vm.$el.querySelector('.actions-header__action-buttons__cancel').click()
        vm._watcher.run()

        expect(router.go).to.have.been.calledOnce
      }).then(done, done)
    })
  })

  describe('loadFromData', () => {
    it('should prepare the copied ligand', (done) => {
      // given
      sandbox.stub(vm._service, 'getLigandBy').resolves({
        data: {
          testKey: 'testValue',
          label: 'test label',
        }
      })

      // when
      vm.loadFormData('anything').then(() => {
        // then
        vm.ligand.should.be.deep.equal({
          testKey: 'testValue',
          id: null,
          slug: null,
          label: 'Copy of test label',
          conceptId: null,
          batchId: null,
          ligandEnabledFields: LigandEnabledFields.ALL,
          availableForSampleMaking: true
        })
      }).then(done, done)
    })
  })
})
