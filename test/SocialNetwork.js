const DatosDeportivos = artifacts.require('./DatosDeportivos.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('DatosDeportivos', ([deployer, author, tipper]) => {
  let datosDeportivos

  before(async () => {
    datosDeportivos = await DatosDeportivos.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await datosDeportivos.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('tiene una liga', async () => {
      const liga = await datosDeportivos.liga()
      assert.equal(liga, 'Champions League')
    })
  })

  describe('posts', async () => {
    let result, postCount

    before(async () => {
      result = await datosDeportivos.createPost('Barca','Real',0 ,{ from: author })
      postCount = await datosDeportivos.postCount()
    })

    it('creates posts', async () => {
      // SUCESS
      assert.equal(postCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.equipo1, 'Barca', 'e1 is correct')
      assert.equal(event.equipo2, 'Real', 'e2 is correct')
      assert.equal(event.tip, '0', 'tip is correct')
      assert.equal(event.author, author, 'author is correct')

      // FAILURE: Post must have content
      await datosDeportivos.createPost('', { from: author }).should.be.rejected;
    })

    it('lists posts', async () => {
      const post = await datosDeportivos.posts(postCount)
      assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(post.equipo1, 'Barca', 'e1 is correct')
      assert.equal(post.equipo2, 'Real', 'e2 amount is correct')
      assert.equal(event.tip, '0', 'tip is correct')
      assert.equal(post.author, author, 'author is correct')
    })

    it('allows users to tip posts', async () => {
      // Track the author balance before purchase
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      result = await datosDeportivos.tipPost(postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

      // SUCESS
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(post.equipo1, 'Barca', 'e1 is correct')
      assert.equal(post.equipo2, 'Real', 'e2 is correct')
      assert.equal(event.tip, '1000000000000000000', 'tip is correct')
      assert.equal(event.author, author, 'author is correct')

      // Check that author received funds
      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let monto
      monto = web3.utils.toWei('1', 'Ether')
      monto = new web3.utils.BN(monto)

      const exepectedBalance = oldAuthorBalance.add(monto)

      assert.equal(newAuthorBalance.toString(), exepectedBalance.toString())

      // FAILURE: Tries to tip a post that does not exist
      await datosDeportivos.tipPost(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
    })

  })
})
