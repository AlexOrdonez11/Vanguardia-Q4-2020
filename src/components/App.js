import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import DatosDeportivos from '../abis/DatosDeportivos.json'
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = DatosDeportivos.networks[networkId]
    if(networkData) {
      const datosDeportivos = web3.eth.Contract(DatosDeportivos.abi, networkData.address)
      this.setState({ datosDeportivos })
      const postCont = await datosDeportivos.methods.postCount().call()
      this.setState({ postCont })
      // Load Posts
      for (var i = 1; i <= postCont; i++) {
        const post = await datosDeportivos.methods.posts(i).call()
        this.setState({
          posts: [...this.state.posts, post]
        })
      }
      // Sort posts. Show highest tipped posts first
      this.setState({
        posts: this.state.posts.sort((a,b) => b.tip - a.tip )
      })
      this.setState({ loading: false})
    } else {
      window.alert('Contract not deployed to detected network.')
    }
  }

  createPost(equipo1) {
    this.setState({ loading: true })
    this.state.datosDeportivos.methods.createPost(equipo1,"equipo2").send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  tipPost(id, monto) {
    this.setState({ loading: true })
    this.state.datosDeportivos.methods.tipPost(id).send({ from: this.state.account, value: monto })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      datosDeportivos: null,
      postCont: 0,
      posts: [],
      loading: true
    }

    this.createPost = this.createPost.bind(this)
    this.tipPost = this.tipPost.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              posts={this.state.posts}
              createPost={this.createPost}
              tipPost={this.tipPost}
            />
        }
      </div>
    );
  }
}

export default App;
