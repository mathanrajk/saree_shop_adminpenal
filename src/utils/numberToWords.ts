/**
 * Converts a number to Indian Currency words (e.g., 4500 -> "Four Thousand Five Hundred Rupees Only")
 */
export function numberToWordsINR(num: number): string {
  if (num === 0) return 'Zero Rupees Only';

  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const b = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return a[n];
    const tens = b[Math.floor(n / 10)];
    const units = a[n % 10];
    return tens + (units ? ' ' + units : '');
  }

  function convertThreeDigits(n: number): string {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    let res = '';
    if (hundreds > 0) {
      res += a[hundreds] + ' Hundred';
      if (remainder > 0) res += ' and ';
    }
    if (remainder > 0) {
      res += convertTwoDigits(remainder);
    }
    return res;
  }

  const integerPart = Math.floor(num);

  const crore = Math.floor(integerPart / 10000000);
  const lakh = Math.floor((integerPart % 10000000) / 100000);
  const thousand = Math.floor((integerPart % 100000) / 1000);
  const hundreds = integerPart % 1000;

  let str = '';

  if (crore > 0) {
    str += convertTwoDigits(crore) + ' Crore ';
  }
  if (lakh > 0) {
    str += convertTwoDigits(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    str += convertTwoDigits(thousand) + ' Thousand ';
  }
  if (hundreds > 0) {
    str += convertThreeDigits(hundreds);
  }

  return (str.trim() + ' Rupees Only');
}
