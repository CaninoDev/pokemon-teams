const BASE_URL = 'http://localhost:3000'
const TRAINERS_URL = `${BASE_URL}/trainers`
const POKEMONS_URL = `${BASE_URL}/pokemons`
const main = document.getElementsByTagName('main')
var trainersArray = []
var pokemonsArray = []

class Trainer {
  constructor (id, name, pokemons = []) {
    this.id = id
    this.name = name
    this.pokemons = pokemons
    trainersArray.push(this)
  }

  addPokemon () {
    const trainerId = this.parentElement.dataset.id
    const trainer = trainersArray.find(trainer => trainer.id == trainerId)
    if (trainer.pokemons.length < 6) {
      fetch(POKEMONS_URL, {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({trainer_id: `${trainerId}`})
      }).then(function (response) {
        return response.json()
      }).then(function (newPokemon) {
        if (pokemonsArray.find(pokemon => pokemon.id == newPokemon.id)) {
          const pokemonObj = pokemonsArray.find(pokemon => pokemon.id == newPokemon.id)
          trainer.pokemons.push(pokemonObj)
          pokemonObj.render()
        } else {
          const pokemonObj = new Pokemon(newPokemon.id, newPokemon.nickname, newPokemon.species, newPokemon.trainer_id)
          trainer.pokemons.push(pokemonObj)
          pokemonObj.render()
        }
      })
    }
  }

  render () {
    const div = App.createElement('div', {class: 'card'}, main[0])
    div.dataset.id = this.id
    const p = App.createElement('p', '', div, `${this.name}`)
    const addButton = App.createElement('button', '', div, 'Add Pokemon')
    addButton.addEventListener('click', this.addPokemon)
    const ul = App.createElement('ul', {id: `trainer-${this.id}`}, div)
  }
}

class Pokemon {
  constructor (id, nickname, species, trainerId = '') {
    this.id = id
    this.nickname = nickname
    this.species = species
    this.trainer_id = trainerId
    pokemonsArray.push(this)
  }

  release () {
    const pokemon_id = this.parentElement.getAttribute('id').slice(8)
    this.parentElement.remove()
    window.fetch(`${POKEMONS_URL}/:${pokemon_id}`).then(function (response) {
      return response.json()
    }).then(function (pokemon) {

    })
  }

  render () {
    const trainerUL = document.getElementById(`trainer-${this.trainer_id}`)
    const li = App.createElement('li', {id: `pokemon-${this.id}`}, trainerUL, `${this.nickname} (${this.species}) `)
    const releaseButton = App.createElement('button', {class: 'release'}, li, 'Release')
    releaseButton.addEventListener('click', this.release)
  }
}

class App {
  constructor () {
    this.gatherData(TRAINERS_URL)
  }

  static createElement (element, attribute = '', parent = '', inner = '') {
    if (typeof (element) === 'undefined') {
      return false
    }
    let e = document.createElement(element)
    if (!Array.isArray(attribute)) {
      attribute = [attribute]
    }
    if ((typeof (attribute) === 'object') && (attribute !== '')) {
      for (let attr of attribute) {
        for (let key in attr) {
          e.setAttribute(key, attr[key])
        }
      }
    }
    if (!Array.isArray(inner)) {
      inner = [inner]
    }
    for (var i = 0; i < inner.length; i++) {
      if (inner[i].tagName) {
        e.appendChild(inner[i])
      } else {
        e.appendChild(document.createTextNode(inner[i]))
      }
    }
    if (parent) {
      parent.appendChild(e)
    }
    return e
  }

  gatherData (url) {
    window.fetch(url).then(response => {
      return response.json()
    }).then(trainers => {
      for (let trainer of trainers) {
        const t = new Trainer(trainer.id, trainer.name)
        t.render()
        for (let pokemon of trainer.pokemons) {
          const p = new Pokemon(pokemon.id, pokemon.nickname, pokemon.species, pokemon.trainer_id)
          t.pokemons.push(t)
          p.render()
        }
      }
    })
  }
}

const app = new App()
