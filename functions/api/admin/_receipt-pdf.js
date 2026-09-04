import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const clean = value => String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
const money = cents => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
const dateBr = value => { const [y, m, d] = String(value).split('-'); return `${d}/${m}/${y}`; };
function wrap(text, font, size, width) {
  const lines = []; let line = '';
  for (const word of clean(text).split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(next, size) > width) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line); return lines;
}
function toBase64(bytes) {
  let value = '';
  for (let i = 0; i < bytes.length; i += 8192) value += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(value);
}

export async function createReceiptPdf(receipt, env) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(.07, .11, .2), blue = rgb(.05, .43, .88), gray = rgb(.39, .45, .55);
  page.drawRectangle({ x: 0, y: 744, width: 595.28, height: 98, color: navy });
  page.drawText('MANINHO CRIATIVOS', { x: 44, y: 806, size: 10, font: bold, color: rgb(.35, .68, 1) });
  page.drawText('RECIBO DE PRESTAÇÃO DE SERVIÇOS', { x: 44, y: 775, size: 17, font: bold, color: rgb(1, 1, 1) });
  page.drawText('DOCUMENTO NÃO FISCAL', { x: 44, y: 755, size: 8, font: bold, color: rgb(.72, .78, .86) });
  page.drawText('NÚMERO DO DOCUMENTO', { x: 405, y: 807, size: 6, font: bold, color: rgb(.72, .78, .86) });
  page.drawText(receipt.document_code, { x: 405, y: 791, size: 8, font: bold, color: rgb(1, 1, 1) });
  page.drawText('PRESTADOR DO SERVIÇO', { x: 44, y: 716, size: 8, font: bold, color: gray });
  page.drawText('Maninho Criativos', { x: 44, y: 699, size: 12, font: bold, color: navy });
  page.drawRectangle({ x: 44, y: 635, width: 507, height: 46, color: rgb(.94, .96, .98) });
  page.drawText('VALOR RECEBIDO', { x: 60, y: 653, size: 8, font: bold, color: gray });
  page.drawText(money(receipt.amount_cents), { x: 414, y: 649, size: 18, font: bold, color: blue });
  page.drawText('TOMADOR DO SERVIÇO', { x: 44, y: 608, size: 8, font: bold, color: gray });
  page.drawText(clean(receipt.recipient_name), { x: 44, y: 588, size: 12, font: bold, color: navy });
  if (receipt.client_document) page.drawText(`CPF/CNPJ: ${clean(receipt.client_document)}`, { x: 44, y: 570, size: 9, font: regular, color: gray });
  if (receipt.client_address) page.drawText(clean(receipt.client_address), { x: 44, y: 553, size: 8, font: regular, color: gray, maxWidth: 507 });
  page.drawRectangle({ x: 44, y: 445, width: 507, height: 82, color: rgb(.98, .985, .99) });
  page.drawText('DESCRIÇÃO DO SERVIÇO', { x: 60, y: 510, size: 7, font: bold, color: gray });
  wrap(receipt.description, regular, 10, 475).slice(0, 4).forEach((line, index) => page.drawText(line, { x: 60, y: 488 - index * 15, size: 10, font: regular, color: navy }));
  page.drawText('FORMA DE PAGAMENTO', { x: 44, y: 414, size: 8, font: bold, color: gray });
  page.drawText(clean(receipt.payment_method || 'Nao informada'), { x: 44, y: 395, size: 10, font: bold, color: navy });
  page.drawText('DATA DE EMISSÃO', { x: 340, y: 414, size: 8, font: bold, color: gray });
  page.drawText(dateBr(receipt.receipt_date), { x: 340, y: 395, size: 10, font: bold, color: navy });
  if (receipt.signature_url) {
    const key = new URL(receipt.signature_url).pathname.replace(/^\/uploads\//, '');
    const object = await env.STORAGE.get(key);
    if (object) { const image = await pdf.embedPng(await object.arrayBuffer()); const size = image.scaleToFit(190, 70); page.drawImage(image, { x: (595.28 - size.width) / 2, y: 230, width: size.width, height: size.height }); }
  }
  page.drawLine({ start: { x: 160, y: 225 }, end: { x: 435, y: 225 }, thickness: 1, color: navy });
  page.drawText('Maninho Criativos', { x: 242, y: 208, size: 10, font: bold, color: navy });
  page.drawText('Assinatura eletrônica do responsável', { x: 205, y: 193, size: 8, font: regular, color: gray });
  page.drawLine({ start: { x: 44, y: 92 }, end: { x: 551, y: 92 }, thickness: .5, color: rgb(.82, .86, .91) });
  page.drawText(`Documento não fiscal | Autenticidade: ${receipt.document_code}`, { x: 145, y: 70, size: 8, font: regular, color: gray });
  const bytes = await pdf.save();
  return { bytes, content: toBase64(bytes), filename: `recibo-${receipt.document_code}.pdf` };
}
