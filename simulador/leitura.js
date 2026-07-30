function criarAleatorio(semente) {
  let estado = semente;
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296;
    return estado / 4294967296;
  };
}

function arredondar(valor, casas) {
  return Number(valor.toFixed(casas));
}

function gerarLeitura(banco, minutos, aleatorio, agora = new Date()) {
  const ruido = (amplitude) => (aleatorio() - 0.5) * 2 * amplitude;
  const r = banco.roteiro;

  if (r.tipo === 'offline' && minutos >= r.aPartirDeMin) {
    return null;
  }

  let tensaoV = 52.8 + ruido(0.15);
  let temperaturaC = 30 + ruido(2.5);
  let correnteA = ruido(0.5);
  let estadoCarga = 0.97 + ruido(0.02);
  let modo = 'flutuacao';

  if (r.tipo === 'degradacao' && minutos >= r.inicioMin) {
    const queda = (minutos - r.inicioMin) * r.quedaVPorMin;
    tensaoV = Math.max(45.2 + ruido(0.2), tensaoV - queda);
    estadoCarga = Math.max(0.2, estadoCarga - (minutos - r.inicioMin) * 0.03);
  }

  if (r.tipo === 'sobretemperatura' && minutos >= r.inicioMin) {
    const subida = (minutos - r.inicioMin) * r.subidaCPorMin;
    temperaturaC = Math.min(53 + ruido(0.8), temperaturaC + subida);
  }

  if (r.tipo === 'pico_temperatura' && minutos >= r.emMin && minutos < r.emMin + r.duracaoMin) {
    temperaturaC = 47.5 + ruido(1);
  }

  if (r.tipo === 'descarga') {
    const fim = r.inicioMin + r.duracaoMin;
    if (minutos >= r.inicioMin && minutos < fim) {
      const decorrido = minutos - r.inicioMin;
      modo = 'descarga';
      correnteA = -32 + ruido(4);
      tensaoV = 51.5 - decorrido * 0.12 + ruido(0.2);
      estadoCarga = Math.max(0.35, 0.97 - decorrido * 0.025);
    } else if (minutos >= fim && minutos < fim + 6) {
      modo = 'recarga';
      correnteA = 14 + ruido(2);
      tensaoV = 54.2 + ruido(0.2);
      estadoCarga = Math.min(0.99, 0.5 + (minutos - fim) * 0.08);
    }
  }

  return {
    bancoId: banco.bancoId,
    siteId: banco.siteId,
    timestamp: agora.toISOString(),
    tensaoV: arredondar(tensaoV, 2),
    correnteA: arredondar(correnteA, 2),
    temperaturaC: arredondar(temperaturaC, 1),
    estadoCarga: arredondar(estadoCarga, 3),
    modo,
  };
}

module.exports = { gerarLeitura, criarAleatorio };
