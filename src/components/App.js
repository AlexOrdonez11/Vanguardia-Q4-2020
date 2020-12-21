import React, { Component, InputHTMLAttributes } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import DatosDeportivos from '../abis/DatosDeportivos.json'
import Navbar from './Navbar'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    console.log("leo kbron")
    await this.loadBlockchainData()
    console.log("leo kbron1")
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
    console.log("leo kbron2")
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    console.log(networkId)
    const networkData = DatosDeportivos.networks[networkId]
    console.log(networkData)
    if (networkData) {
      const datosDeportivos = web3.eth.Contract(DatosDeportivos.abi, networkData.address)
      this.setState({ datosDeportivos })
      const postCont = await datosDeportivos.methods.postCount().call()
      console.log("leo kbron4")
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
        posts: this.state.posts.sort((a, b) => b.tip - a.tip)
      })
      this.setState({ loading: false })
    } else {
      window.alert('Contract not deployed to detected network.')
    }
  }

  createPost() {
    this.setState({ loading: true })
    //this.state.data.forEach(element => {
    //console.log(element.homeTeam.team_name);
    //console.log(element.awayTeam.team_name);
    this.state.datosDeportivos.methods.createPost(this.state.data[0].homeTeam.team_name, this.state.data[0].awayTeam.team_name).send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
        //})
      });
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
      loading: true,
      data: null
    }
    this.createPost = this.createPost.bind(this)
    this.tipPost = this.tipPost.bind(this)

  }

  render() {
    var fixt = (JSON.parse(this.props.body).api.fixtures);
    const fixtures = fixt.map((fix, i) => {
      return (
        <div className="col-md-6" key={i}>
          <div style={{ margin: '30px 0px 0px 1px' }}>
            <div class="card">
              <center>
                <img src={fix.homeTeam.logo} />  {fix.goalsHomeTeam}  VS  {fix.goalsAwayTeam}  <img src={fix.awayTeam.logo} />
                <p>{fix.homeTeam.team_name}{"--"}{fix.awayTeam.team_name}</p>
              </center>
            </div>
          </div>
        </div>
      )
    });
    return (
      <div>
        <Navbar account={this.state.account} />
        <div style={{ margin: '80px 0px 0px 0px' }}>
            <center><h2>Ultima Ronda de Champions</h2></center>
        </div>
        <div className="container">
          <div style={{ margin: '40px 0px 0px 30px' }}>
            <center>
            <div className="row mt-10">
              <div className="col-md-12">
                <div className="row">
                  {fixtures}
                </div>
              </div>
            </div>
            </center>
          </div>
        </div>
        {/* { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
            posts={this.state.posts}
            createPost={this.createPost}
            tipPost={this.tipPost}
          />
        } */}
      </div>
    );
  }
}

export default App;
