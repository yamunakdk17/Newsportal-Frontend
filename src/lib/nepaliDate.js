import NepaliDate from 'nepali-date-converter';

const NEPALI_MONTHS = [
  'बैशाख',
  'जेठ',
  'असार',
  'श्रावण',
  'भाद्र',
  'आश्विन',
  'कार्तिक',
  'मंसिर',
  'पौष',
  'माघ',
  'फाल्गुण',
  'चैत्र',
];

const NEPALI_DAYS = [
  'आइतबार',
  'सोमबार',
  'मंगलबार',
  'बुधबार',
  'बिहिबार',
  'शुक्रबार',
  'शनिबार',
];

const NEPALI_DIGITS = '०१२३४५६७८९';

const toNepaliNumber = (value) =>
  String(value).replace(/\d/g, (digit) => NEPALI_DIGITS[digit]);

export function formatNepaliDate(dateValue) {
  if (!dateValue) return '';

  try {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const nepaliDate = new NepaliDate(date);

    const year = nepaliDate.getYear();
    const month = nepaliDate.getMonth();
    const day = nepaliDate.getDate();

    const weekday = date.getDay();

    return `${toNepaliNumber(year)} ${
      NEPALI_MONTHS[month - 1] || ''
    } ${toNepaliNumber(day)}, ${NEPALI_DAYS[weekday]}`;
  } catch (error) {
    console.error('Unable to convert date to Nepali:', error);
    return '';
  }
}
