/**
 * Simple and robust OFX parser for the browser.
 * Converts SGML-like OFX strings into structured JSON.
 */

export interface OfxTransaction {
  type: 'CREDIT' | 'DEBIT' | 'OTHER';
  date: string;
  amount: number;
  id: string;
  memo: string;
  name: string;
  checkNum: string;
  category: string;
  rawTags: Record<string, string>; // Capture all tags for "list all data" requirement
}

export interface OfxData {
  bankId: string;
  accountId: string;
  currency: string;
  transactions: OfxTransaction[];
}

export const CATEGORY_MAP: Record<string, string[]> = {
  'Taxas e Impostos': ['IOF', 'TARIFA', 'JUROS', 'IMPOSTO', 'MANUTENCAO CONTA'],
  'Transporte': ['UBER', '99APP', 'POSTO', 'COMBUSTIVEL', 'ESTACIONAMENTO', 'PEDAGIO'],
  'Alimentação': ['IFOOD', 'RESTAURANTE', 'MERCADO', 'SUPERMERCADO', 'PADARIA', 'LANCHONETE'],
  'Serviços / Utilidades': ['LUZ', 'AGUA', 'INTERNET', 'TELEFONE', 'CELULAR', 'CONDOMINIO', 'ALUGUEL'],
  'Lazer': ['NETFLIX', 'SPOTIFY', 'STEAM', 'CINEMA', 'SHOPPING', 'VIAGEM'],
  'Saúde': ['FARMACIA', 'DROGARIA', 'HOSPITAL', 'MEDICO', 'EXAME'],
  'Renda / Transferência': ['SALARIO', 'PIX RECEBIDO', 'TED RECEBIDO', 'DOC RECEBIDO', 'DEPOSITO'],
};

export function categorize(text: string): string {
  const upperText = text.toUpperCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(k => upperText.includes(k))) {
      return category;
    }
  }
  return 'Outros';
}

export function parseOfx(ofxString: string): OfxData {
  const data: OfxData = {
    bankId: '',
    accountId: '',
    currency: 'BRL',
    transactions: [],
  };

  // 1. Extract Bank Info
  const bankIdMatch = ofxString.match(/<BANKID>(.*)/i);
  if (bankIdMatch) data.bankId = bankIdMatch[1].trim();

  const acctIdMatch = ofxString.match(/<ACCTID>(.*)/i);
  if (acctIdMatch) data.accountId = acctIdMatch[1].trim();

  const curMatch = ofxString.match(/<CURDEF>(.*)/i);
  if (curMatch) data.currency = curMatch[1].trim();

  // 2. Extract Transactions (STMTTRN blocks)
  const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;

  while ((match = trnRegex.exec(ofxString)) !== null) {
    const block = match[1];
    const rawTags: Record<string, string> = {};
    
    // Generic tag extraction within the block
    const tagsMatch = block.match(/<([A-Z0-9]+)>(.*)/gi);
    if (tagsMatch) {
      tagsMatch.forEach(tagLine => {
        const parts = tagLine.match(/<([A-Z0-9]+)>(.*)/i);
        if (parts && parts[1]) {
          rawTags[parts[1].toUpperCase()] = parts[2].trim();
        }
      });
    }

    const typeRaw = rawTags['TRNTYPE'] || '';
    const dateRaw = rawTags['DTPOSTED'] || '';
    const amtRaw = rawTags['TRNAMT'] || '0';
    const id = rawTags['FITID'] || crypto.randomUUID();
    const memo = rawTags['MEMO'] || '';
    const name = rawTags['NAME'] || 'Sem nome';
    const checkNum = rawTags['CHECKNUM'] || '---';

    // Format Date: YYYYMMDD... -> YYYY-MM-DD
    let formattedDate = dateRaw;
    if (dateRaw.length >= 8) {
      formattedDate = `${dateRaw.slice(0, 4)}-${dateRaw.slice(4, 6)}-${dateRaw.slice(6, 8)}`;
    }

    const amount = parseFloat(amtRaw.replace(',', '.'));
    const fullDescription = `${name} ${memo}`.trim();

    data.transactions.push({
      type: amount >= 0 ? 'CREDIT' : 'DEBIT',
      date: formattedDate,
      amount: Math.abs(amount),
      id,
      memo,
      name,
      checkNum,
      category: categorize(fullDescription),
      rawTags
    });
  }

  // Sort by date descending
  data.transactions.sort((a, b) => b.date.localeCompare(a.date));

  return data;
}
