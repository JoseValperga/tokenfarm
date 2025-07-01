
# 🪙 TokenFarm – Staking Platform

**Proyecto Solidity + Hardhat para deploy y test de un contrato inteligente de staking en Sepolia.**  
Incluye:
✅ Contrato TokenFarm + DAppToken + LPToken.  
✅ Scripts de deploy con Hardhat Ignition.  
✅ Scripts de interacción.  
✅ Test suite con Hardhat.  
✅ Listo para integrar un frontend con React.

---

## ⚡ Tabla de Contenidos
- [Entorno de desarrollo y pruebas](#entorno-de-desarrollo-y-pruebas)
- [Requisitos para instalación](#requisitos-para-instalación)
- [Instalación](#instalación)
- [Configuración del entorno (.env)](#configuración-del-entorno-env)
- [Compilación de contratos](#compilación-de-contratos)
- [Test](#test)
- [Deploy local](#deploy-local)
- [Deploy a Sepolia](#deploy-a-sepolia)
- [Interacción en localhost](#interacción-en-localhost)
- [Interacción en Sepolia](#interacción-en-sepolia)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Contacto](#contacto)

---

## Entorno de desarrollo y pruebas

El proyecto fue desarrollado y probado en el siguiente entorno real:

🖥️ **Sistema operativo principal:**
- Windows 11

🐧 **Entorno Linux:**
- WSL2 (Windows Subsystem for Linux)
  - Distribución: Ubuntu 24.04 LTS
  - Uso:
    - Terminal de desarrollo
    - Gestión de dependencias npm
    - Hardhat CLI
    - Deploy en Sepolia
    - Deploy en localhost
  - Ventajas:
    - Entorno Linux nativo dentro de Windows
    - Compatibilidad total con Hardhat e Ignition

📝 **Editor de código:**
- Visual Studio Code
  - Integración remota con WSL2
  - Extensiones recomendadas:
    - Solidity (Juan Blanco)
    - Prettier
    - ESLint
    - DotENV
    - Remote - WSL

⚙️ **Node.js:**
- Versión 18.x (instalado en Ubuntu/WSL2)

📦 **Gestor de paquetes:**
- npm 9.x

🛠️ **Framework de desarrollo para Smart Contracts:**
- Hardhat 2.20+
- Hardhat Ignition

🔗 **Librerías principales:**
- ethers v6
- @nomicfoundation/hardhat-toolbox
- @nomicfoundation/hardhat-ignition
- dotenv
- OpenZeppelin Contracts 5.x

🌐 **Redes utilizadas:**
- Localhost (Hardhat Network)
- Sepolia (Ethereum Testnet)

🔄 **Control de versiones:**
- Git (CLI en WSL2)
- GitHub para hosting del repositorio

🌐 **Opcional para frontend:**
- React 18+
- Vite
- Tailwind CSS
- Ethers v6 para Web

## Requisitos para instalación
- Entorno de desarrollo instalado
- Cuenta en [Metamask](https://metamask.io/)- Sepolia (3 cuentas con ETH de prueba)
- Cuenta en [ETHERSCAN](https://etherscan.io/)
- Cuenta en [Alchemy](https://www.alchemy.com/)


---

## Instalación

```bash
git clone https://github.com/JoseValperga/tokenfarm.git
cd tokenfarm
npm install
````

---

## Configuración del entorno para deploy en localhost(.env) - Ver Deploy local para indicaciones

Renombra el archivo _hardhat.config.js como hardhat.config.js. Crea un archivo `.env` en la raíz del proyecto con:

```bash
OWNER_PRIVATE_KEY=tu_owner_private_key
# Direcciones en localhost (rellena después del deploy)
TOKENFARM_ADDRESS=...
LPTOKEN_ADDRESS=...
DAPPTOKEN_ADDRESS=...
```
---

## Configuración del entorno para deploy en Sepolia(.env) - Ver Deploy a Sepolia para indicaciones

Debes utilizar el archivo hardhat.config.js original. Crea un archivo `.env` en la raíz del proyecto con:

```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY
OWNER_PRIVATE_KEY=...
OWNER_ADDRESS=...
USER1_PRIVATE_KEY=...
USER2_PRIVATE_KEY=...
ETHERSCAN_API_KEY=...
# Direcciones en Sepolia (rellena después del deploy)
TOKENFARM_ADDRESS=...
LPTOKEN_ADDRESS=...
DAPPTOKEN_ADDRESS=...
```
---
⚠️ IMPORTANTE: Las address y private keys de owner, y las private keys de user1 y user2 las debes obtener de las cuentas de tu billetera Metamask. A ETHERSCAN_API_KEY la obtienes del API Dashboard de tu cuenta [ETHERSCAN](https://etherscan.io/). A SEPOLIA_RPC_URL la obtienes de tu cuenta [Alchemy](https://www.alchemy.com/)


## Compilación de contratos

```bash
npx hardhat compile
```

---

## Test

Ejecutar todos los tests locales:

```bash
npx hardhat test
```

✅ Incluye pruebas de:

* Trabaja con OWNER y dos USERS
* Aprobar LP.
* Depositar en staking.
* Distribuir recompensas.
* Reclamar recompensas.
* Retirar staking.
* Retirar fees.

✅ Requiere:

* `"type": "module"` en `package.json`.
* Hardhat local node para simular cuentas.

✅ Al lanzar el test se corren 3 pruebas unitarias en Hardhat que aseguran el flujo principal de la lógica del contrato. El resultado esperado al ejecutar los test es el siguiente:

- ✔️ **Depósito de LP Tokens:** valida que los usuarios puedan aprobar y depositar tokens LP en staking, actualizando sus balances y el total del contrato.
  
- ✔️ **Distribución y reclamo de recompensas:** verifica que el owner pueda distribuir recompensas proporcionalmente al staking, y que los usuarios puedan reclamar sus DAPP tokens correctamente con la fee correspondiente.
  
- ✔️ **Retiro de staking:** asegura que los usuarios puedan retirar sus LP tokens del staking, dejando su balance en cero y devolviendo los tokens correctamente.

---

## Deploy local

✅ Arrancar nodo local de Hardhat: Abre una terminal y teclea

```bash
npx hardhat node
```
✅ Guarda en tu `.env` la dirección de una de las wallets

``` 
OWNER_ADDRESS=...
```

✅ Deploy usando Ignition: Sin cerrar la primera terminal, abre una segunda terminal y teclea

```bash
npx hardhat ignition deploy ignition/modules/TokenFarmModule.js --network localhost
```

✅ Guarda las direcciones en tu `.env`:

```
TOKENFARM_ADDRESS=...
LPTOKEN_ADDRESS=...
DAPPTOKEN_ADDRESS=...
```

---

## Deploy a Sepolia

```bash
npx hardhat ignition deploy ignition/modules/TokenFarmModule.js --network sepolia
```

✅ Salida esperada:

```
Deployed Addresses
TokenFarmModule#DAppToken - 0x...
TokenFarmModule#LPToken - 0x...
TokenFarmModule#TokenFarm - 0x...
```

✅ Copia estas direcciones en tu `.env`.

---

## Interacción en localhost

✅ 1️⃣ Arrancar nodo local:

```bash
npx hardhat node
```

✅ 2️⃣ Ejecutar el script de interacción:

```bash
npx hardhat run scripts/interact_localhost.js --network localhost
```

✅ El script realiza, al igual que la interacción en Sepolia:

* Trabaja con OWNER y dos USERS
* Configuración de rewardPerBlock y feePercentage.
* Transferencia de LP del owner a los usuarios si faltan.
* Approve dinámico.
* Depósitos en staking.
* Distribución de recompensas.
* Reclamo de recompensas.
* Retiro de staking.
* Retiro de fees por parte del owner.

---

## Interacción en Sepolia

⚠️ IMPORTANTE: Sepolia no mina bloques al instante.
✅ El script incluye **pausas de 15 segundos** para esperar nuevos bloques entre:

* Depositar y distribuir recompensas.
* Distribuir recompensas y claim de recompensas.

⚠️ ⚠️ Pueden surgir fallas si Sepolia está muy "lenta". Puedes cambiar la espera a 30 o 45 segundos. De todas formas, al funcionar en localhost sin fallas, se confirma el correcto funcionamiento del cont

✅ Ejecutar:

```bash
npx hardhat run scripts/interact.js --network sepolia
```

✅ Salida esperada:

```
✅ Approvals realizados.
✅ Depósitos completados.
✅ Recompensas distribuidas.
✅ Recompensas reclamadas.
✅ Retiros completados.
✅ Fees retirados al owner.
🎯 ✅ Interacción COMPLETA con TokenFarm en SEPOLIA!
```

---

## Estructura del Proyecto

```
.
├── contracts
│   ├── TokenFarm.sol
│   ├── DAppToken.sol
│   └── LPToken.sol
├── scripts
│   └── interact.js
├── ignition
│   └── modules
│       └── TokenFarmModule.js
├── test
│   └── TokenFarm.test.js
├── .env
└── package.json
```

---

## Features del Contrato

✅ Usuarios:

* Ver balances de LP y DAPP.
* Aprobar y depositar LP en staking.
* Ver staking balance.
* Ver recompensas pendientes.
* Reclamar recompensas.
* Retirar staking.

✅ Owner:

* Configurar **rewardPerBlock**.
* Configurar **feePercentage**.
* Distribuir recompensas a todos los stakers.
* Ver fees acumulados.
* Retirar fees acumulados.

---

## Notas Avanzadas

✅ En Sepolia necesitas:

* ETH en owner, user1, user2.
* LP distribuido para que puedan hacer stake.

✅ El script:

* Transfiere LP solo si hace falta.
* Hace approvals con `.wait()` para confirmación.
* Usa pausas para esperar bloques reales.

✅ Ajustable:

* Pausa de 15s → se puede aumentar a 20-30s si Sepolia está lento.

---

## Contacto

📨 Autor: José Valperga
💻 GitHub: [https://github.com/JoseValperga](https://github.com/JoseValperga)
📫 Email: [jose.valperga@gmail.com](mailto:jose.valperga@gmail.com)

---

## ⚡ Licencia

MIT License.

---

**🚀 ¡Gracias por usar TokenFarm!**
**Staking real en Sepolia, 100% probado y funcional.**
Construido con ❤️ con Solidity y Hardhat.

