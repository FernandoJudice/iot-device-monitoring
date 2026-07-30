// Executado automaticamente pelo Mongo na primeira subida do container.
// Se o volume ja existir, rode: docker compose down -v && docker compose up

db = db.getSiblingDB('moura');

db.usuarios.deleteMany({});
db.contratos.deleteMany({});
db.sites.deleteMany({});
db.bancos.deleteMany({});

db.usuarios.insertMany([
  {
    "email": "ana.souza@exemplo.com",
    "nome": "Ana Souza",
    "perfil": "operador",
    "contratos": [],
    "senhaHash": "$2b$10$QPV2uMRx6bnlLwEd9pGlBO/rmqSFkDCyAZo5CnjecU/t4Tog1LHqG"
  },
  {
    "email": "carlos.lima@exemplo.com",
    "nome": "Carlos Lima",
    "perfil": "operador",
    "contratos": [],
    "senhaHash": "$2b$10$QPV2uMRx6bnlLwEd9pGlBO/rmqSFkDCyAZo5CnjecU/t4Tog1LHqG"
  },
  {
    "email": "ricardo@telenordeste.exemplo.com",
    "nome": "Ricardo Alves",
    "perfil": "cliente",
    "contratos": [
      "CT-1001"
    ],
    "senhaHash": "$2b$10$QPV2uMRx6bnlLwEd9pGlBO/rmqSFkDCyAZo5CnjecU/t4Tog1LHqG"
  },
  {
    "email": "juliana@dcsul.exemplo.com",
    "nome": "Juliana Prado",
    "perfil": "cliente",
    "contratos": [
      "CT-1002"
    ],
    "senhaHash": "$2b$10$QPV2uMRx6bnlLwEd9pGlBO/rmqSFkDCyAZo5CnjecU/t4Tog1LHqG"
  }
]);

db.contratos.insertMany([
  {
    "contratoId": "CT-1001",
    "cliente": "Telenordeste Servicos",
    "ativo": true
  },
  {
    "contratoId": "CT-1002",
    "cliente": "Data Center Sul",
    "ativo": true
  }
]);

db.sites.insertMany([
  {
    "siteId": "SITE-0101",
    "nome": "Belo Jardim - Torre Norte",
    "uf": "PE",
    "cidade": "Belo Jardim",
    "contratoId": "CT-1001"
  },
  {
    "siteId": "SITE-0102",
    "nome": "Caruaru - Central",
    "uf": "PE",
    "cidade": "Caruaru",
    "contratoId": "CT-1001"
  },
  {
    "siteId": "SITE-0103",
    "nome": "Recife - Boa Viagem",
    "uf": "PE",
    "cidade": "Recife",
    "contratoId": "CT-1001"
  },
  {
    "siteId": "SITE-0104",
    "nome": "Petrolina - Margem",
    "uf": "PE",
    "cidade": "Petrolina",
    "contratoId": "CT-1001"
  },
  {
    "siteId": "SITE-0105",
    "nome": "Fortaleza - Aldeota",
    "uf": "CE",
    "cidade": "Fortaleza",
    "contratoId": "CT-1001"
  },
  {
    "siteId": "SITE-0106",
    "nome": "Natal - Zona Sul",
    "uf": "RN",
    "cidade": "Natal",
    "contratoId": "CT-1001"
  },
  {
    "siteId": "SITE-0107",
    "nome": "Salvador - Paralela",
    "uf": "BA",
    "cidade": "Salvador",
    "contratoId": "CT-1002"
  },
  {
    "siteId": "SITE-0108",
    "nome": "Feira de Santana - Anel",
    "uf": "BA",
    "cidade": "Feira de Santana",
    "contratoId": "CT-1002"
  },
  {
    "siteId": "SITE-0109",
    "nome": "Sao Paulo - Lapa",
    "uf": "SP",
    "cidade": "Sao Paulo",
    "contratoId": "CT-1002"
  },
  {
    "siteId": "SITE-0110",
    "nome": "Campinas - Distrito",
    "uf": "SP",
    "cidade": "Campinas",
    "contratoId": "CT-1002"
  },
  {
    "siteId": "SITE-0111",
    "nome": "Curitiba - CIC",
    "uf": "PR",
    "cidade": "Curitiba",
    "contratoId": "CT-1002"
  },
  {
    "siteId": "SITE-0112",
    "nome": "Porto Alegre - Zona Norte",
    "uf": "RS",
    "cidade": "Porto Alegre",
    "contratoId": "CT-1002"
  }
]);

db.bancos.insertMany([
  {
    "bancoId": "BR-PE-0101-A",
    "siteId": "SITE-0101",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2020-01-15"
  },
  {
    "bancoId": "BR-PE-0101-B",
    "siteId": "SITE-0101",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2021-02-15"
  },
  {
    "bancoId": "BR-PE-0101-C",
    "siteId": "SITE-0101",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2022-03-15"
  },
  {
    "bancoId": "BR-PE-0101-D",
    "siteId": "SITE-0101",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2023-04-15"
  },
  {
    "bancoId": "BR-PE-0102-A",
    "siteId": "SITE-0102",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2020-01-15"
  },
  {
    "bancoId": "BR-PE-0102-B",
    "siteId": "SITE-0102",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2021-02-15"
  },
  {
    "bancoId": "BR-PE-0102-C",
    "siteId": "SITE-0102",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2022-03-15"
  },
  {
    "bancoId": "BR-PE-0102-D",
    "siteId": "SITE-0102",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2023-04-15"
  },
  {
    "bancoId": "BR-PE-0103-A",
    "siteId": "SITE-0103",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2020-01-15"
  },
  {
    "bancoId": "BR-PE-0103-B",
    "siteId": "SITE-0103",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2021-02-15"
  },
  {
    "bancoId": "BR-PE-0103-C",
    "siteId": "SITE-0103",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2022-03-15"
  },
  {
    "bancoId": "BR-PE-0103-D",
    "siteId": "SITE-0103",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2023-04-15"
  },
  {
    "bancoId": "BR-PE-0104-A",
    "siteId": "SITE-0104",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2020-01-15"
  },
  {
    "bancoId": "BR-PE-0104-B",
    "siteId": "SITE-0104",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2021-02-15"
  },
  {
    "bancoId": "BR-PE-0104-C",
    "siteId": "SITE-0104",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2022-03-15"
  },
  {
    "bancoId": "BR-PE-0104-D",
    "siteId": "SITE-0104",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2023-04-15"
  },
  {
    "bancoId": "BR-CE-0105-A",
    "siteId": "SITE-0105",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2020-01-15"
  },
  {
    "bancoId": "BR-CE-0105-B",
    "siteId": "SITE-0105",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2021-02-15"
  },
  {
    "bancoId": "BR-CE-0105-C",
    "siteId": "SITE-0105",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2022-03-15"
  },
  {
    "bancoId": "BR-RN-0106-A",
    "siteId": "SITE-0106",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2020-01-15"
  },
  {
    "bancoId": "BR-RN-0106-B",
    "siteId": "SITE-0106",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2021-02-15"
  },
  {
    "bancoId": "BR-RN-0106-C",
    "siteId": "SITE-0106",
    "contratoId": "CT-1001",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2022-03-15"
  },
  {
    "bancoId": "BR-BA-0107-A",
    "siteId": "SITE-0107",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2020-01-15"
  },
  {
    "bancoId": "BR-BA-0107-B",
    "siteId": "SITE-0107",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2021-02-15"
  },
  {
    "bancoId": "BR-BA-0107-C",
    "siteId": "SITE-0107",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2022-03-15"
  },
  {
    "bancoId": "BR-BA-0108-A",
    "siteId": "SITE-0108",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2020-01-15"
  },
  {
    "bancoId": "BR-BA-0108-B",
    "siteId": "SITE-0108",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2021-02-15"
  },
  {
    "bancoId": "BR-BA-0108-C",
    "siteId": "SITE-0108",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2022-03-15"
  },
  {
    "bancoId": "BR-SP-0109-A",
    "siteId": "SITE-0109",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2020-01-15"
  },
  {
    "bancoId": "BR-SP-0109-B",
    "siteId": "SITE-0109",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2021-02-15"
  },
  {
    "bancoId": "BR-SP-0109-C",
    "siteId": "SITE-0109",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2022-03-15"
  },
  {
    "bancoId": "BR-SP-0110-A",
    "siteId": "SITE-0110",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2020-01-15"
  },
  {
    "bancoId": "BR-SP-0110-B",
    "siteId": "SITE-0110",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2021-02-15"
  },
  {
    "bancoId": "BR-SP-0110-C",
    "siteId": "SITE-0110",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2022-03-15"
  },
  {
    "bancoId": "BR-PR-0111-A",
    "siteId": "SITE-0111",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2020-01-15"
  },
  {
    "bancoId": "BR-PR-0111-B",
    "siteId": "SITE-0111",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2021-02-15"
  },
  {
    "bancoId": "BR-PR-0111-C",
    "siteId": "SITE-0111",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2022-03-15"
  },
  {
    "bancoId": "BR-RS-0112-A",
    "siteId": "SITE-0112",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2020-01-15"
  },
  {
    "bancoId": "BR-RS-0112-B",
    "siteId": "SITE-0112",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF150",
    "capacidadeAh": 150,
    "tensaoNominalV": 54,
    "instaladoEm": "2021-02-15"
  },
  {
    "bancoId": "BR-RS-0112-C",
    "siteId": "SITE-0112",
    "contratoId": "CT-1002",
    "modelo": "Estacionaria 12MF220",
    "capacidadeAh": 220,
    "tensaoNominalV": 54,
    "instaladoEm": "2022-03-15"
  }
]);

db.usuarios.createIndex({ email: 1 }, { unique: true });
db.sites.createIndex({ siteId: 1 }, { unique: true });
db.bancos.createIndex({ bancoId: 1 }, { unique: true });
db.bancos.createIndex({ siteId: 1 });

print(`[seed] ${db.usuarios.countDocuments()} usuarios, ${db.sites.countDocuments()} sites, ${db.bancos.countDocuments()} bancos`);
