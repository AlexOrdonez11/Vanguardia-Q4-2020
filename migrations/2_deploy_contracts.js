const DatosDeportivos = artifacts.require("DatosDeportivos");

module.exports = function(deployer) {
  deployer.deploy(DatosDeportivos);
};
