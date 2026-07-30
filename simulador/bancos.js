const SITES = [
  { siteId: 'SITE-0101', nome: 'Belo Jardim - Torre Norte', uf: 'PE', cidade: 'Belo Jardim', contratoId: 'CT-1001', qtdBancos: 4 },
  { siteId: 'SITE-0102', nome: 'Caruaru - Central', uf: 'PE', cidade: 'Caruaru', contratoId: 'CT-1001', qtdBancos: 4 },
  { siteId: 'SITE-0103', nome: 'Recife - Boa Viagem', uf: 'PE', cidade: 'Recife', contratoId: 'CT-1001', qtdBancos: 4 },
  { siteId: 'SITE-0104', nome: 'Petrolina - Margem', uf: 'PE', cidade: 'Petrolina', contratoId: 'CT-1001', qtdBancos: 4 },
  { siteId: 'SITE-0105', nome: 'Fortaleza - Aldeota', uf: 'CE', cidade: 'Fortaleza', contratoId: 'CT-1001', qtdBancos: 3 },
  { siteId: 'SITE-0106', nome: 'Natal - Zona Sul', uf: 'RN', cidade: 'Natal', contratoId: 'CT-1001', qtdBancos: 3 },
  { siteId: 'SITE-0107', nome: 'Salvador - Paralela', uf: 'BA', cidade: 'Salvador', contratoId: 'CT-1002', qtdBancos: 3 },
  { siteId: 'SITE-0108', nome: 'Feira de Santana - Anel', uf: 'BA', cidade: 'Feira de Santana', contratoId: 'CT-1002', qtdBancos: 3 },
  { siteId: 'SITE-0109', nome: 'Sao Paulo - Lapa', uf: 'SP', cidade: 'Sao Paulo', contratoId: 'CT-1002', qtdBancos: 3 },
  { siteId: 'SITE-0110', nome: 'Campinas - Distrito', uf: 'SP', cidade: 'Campinas', contratoId: 'CT-1002', qtdBancos: 3 },
  { siteId: 'SITE-0111', nome: 'Curitiba - CIC', uf: 'PR', cidade: 'Curitiba', contratoId: 'CT-1002', qtdBancos: 3 },
  { siteId: 'SITE-0112', nome: 'Porto Alegre - Zona Norte', uf: 'RS', cidade: 'Porto Alegre', contratoId: 'CT-1002', qtdBancos: 3 },
];

const LETRAS = ['A', 'B', 'C', 'D'];

const ROTEIRO = {
  'BR-PE-0102-B': { tipo: 'degradacao', inicioMin: 1, quedaVPorMin: 1.3 },
  'BR-SP-0109-C': { tipo: 'degradacao', inicioMin: 2, quedaVPorMin: 0.8 },
  'BR-BA-0107-A': { tipo: 'sobretemperatura', inicioMin: 1, subidaCPorMin: 9 },
  'BR-SP-0110-B': { tipo: 'pico_temperatura', emMin: 3, duracaoMin: 1 },
  'BR-CE-0105-B': { tipo: 'offline', aPartirDeMin: 3 },
  'BR-PR-0111-A': { tipo: 'descarga', inicioMin: 1, duracaoMin: 22 },
  'BR-RN-0106-C': { tipo: 'descarga', inicioMin: 2, duracaoMin: 4 },
};

function montarBancos() {
  const bancos = [];
  for (const site of SITES) {
    const numero = site.siteId.split('-')[1];
    for (let i = 0; i < site.qtdBancos; i++) {
      const bancoId = `BR-${site.uf}-${numero}-${LETRAS[i]}`;
      bancos.push({
        bancoId,
        siteId: site.siteId,
        contratoId: site.contratoId,
        modelo: i % 2 === 0 ? 'Estacionaria 12MF220' : 'Estacionaria 12MF150',
        capacidadeAh: i % 2 === 0 ? 220 : 150,
        tensaoNominalV: 54,
        instaladoEm: `20${20 + (i % 5)}-0${1 + (i % 9)}-15`,
        roteiro: ROTEIRO[bancoId] || { tipo: 'normal' },
      });
    }
  }
  return bancos;
}

module.exports = { SITES, montarBancos, ROTEIRO };
