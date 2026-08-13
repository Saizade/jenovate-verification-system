const { Student } = require('../models');

const sampleStudents = [
  {
    reference_id: 'JN-2025-001',
    s_no: '1',
    remarks: 'Partial',
    date: '09.05.2025',
    academic_remarks: '1st year',
    counselor_name: 'Jessica',
    full_name: 'Srekumaren',
    phone_no: '7397757599',
    whatsapp_number: '7397757599',
    email: 'srekumarensakthivel2004@gmail.com',
    college_name: 'Vinayaka mission sankarachariyar dental college',
    state: 'Tamil Nadu',
    department: 'BDS',
    course_opted: 'Psychology & Mental Health',
    primary_course: 'psychology',
    secondary_course: 'nil',
    tertiary_course: 'nil',
    type_of_pack: 'Dual Course',
    month_opted: 'july',
    type_of_course: 'course yet to start',
    payment_mode: 'razorpay',
    program_price: 5000,
    amount_received: 5000,
    pending_amount: 0,
    revenue_channel: 'Personal Sale',
    is_locked: true
  },
  {
    reference_id: 'JN-2025-002',
    s_no: '2',
    remarks: 'Full',
    date: '20.05.2025',
    academic_remarks: '1st year',
    counselor_name: 'Jessica',
    full_name: 'S.Naveenasri',
    phone_no: '7548861242',
    whatsapp_number: '7548861242',
    email: 'Naveenasrikumar1422@gmail.com',
    college_name: 'Vinayaka mission sankarachariyar dental college',
    state: 'Tamil Nadu',
    department: 'BDS',
    course_opted: 'Psychology & Mental Health',
    primary_course: 'psychology',
    secondary_course: 'nil',
    tertiary_course: 'nil',
    type_of_pack: 'Dual Course',
    month_opted: 'july',
    type_of_course: 'course yet to start',
    payment_mode: 'razorpay',
    program_price: 5000,
    amount_received: 5000,
    pending_amount: 0,
    revenue_channel: 'Call & Convert',
    is_locked: true
  },
  {
    reference_id: 'JN-2025-003',
    s_no: '3',
    remarks: 'Full',
    date: '23.05.2025',
    academic_remarks: '1st year',
    counselor_name: 'Jessica',
    full_name: 'Srishti Maheshwari',
    phone_no: '8310200417',
    whatsapp_number: '8310200417',
    email: 'mail.maheshwari.srishti@gmail.com',
    college_name: 'SDM Medical college',
    state: 'Karnataka',
    department: 'MBBS',
    course_opted: 'Psychology & Mental Health',
    primary_course: 'psychology',
    secondary_course: 'nil',
    tertiary_course: 'nil',
    type_of_pack: 'Dual Course',
    month_opted: 'july',
    type_of_course: 'course yet to start',
    payment_mode: 'razorpay',
    program_price: 5099,
    amount_received: 5099,
    pending_amount: 0,
    revenue_channel: 'Call & Convert',
    is_locked: true
  },
  {
    reference_id: 'JN-2025-012',
    s_no: '12',
    remarks: 'Full',
    date: '04.06.2025',
    academic_remarks: '1st year',
    counselor_name: 'Shan',
    full_name: 'Mohammad Shabeel T',
    phone_no: '9019634536',
    whatsapp_number: '9019634536',
    email: 'mhdshabeel347@gmail.com',
    college_name: 'Nitte institution of professional education',
    state: 'Karnataka',
    department: 'BBA Honours',
    course_opted: 'FINANCE & STOCK MARKET',
    primary_course: 'finance & accounting',
    secondary_course: 'nil',
    tertiary_course: 'nil',
    type_of_pack: 'Triple courses',
    month_opted: 'july',
    type_of_course: 'course yet to start',
    payment_mode: 'QR',
    program_price: 5500,
    amount_received: 5500,
    pending_amount: 0,
    revenue_channel: 'Call & Convert',
    is_locked: true
  }
];

const seedStudents = async () => {
  try {
    const count = await Student.count();
    if (count === 0) {
      await Student.bulkCreate(sampleStudents);
      console.log('Sample PDF dataset students seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding sample students:', error);
  }
};

module.exports = seedStudents;
