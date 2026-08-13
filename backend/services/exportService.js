const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Export students as PDF
 */
const exportStudentsPDF = async (students) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Title
      doc.fontSize(20).font('Helvetica-Bold').text('Jenovate Verification System', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica').text('Student Records Report', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(1);

      // Table headers for PDF
      const headers = ['Ref ID', 'S.no', 'Name', 'Counselor', 'College', 'Department', 'Course Opted', 'Received', 'Pending', 'Channel'];
      const colWidths = [70, 35, 95, 65, 110, 60, 110, 50, 50, 65];
      const startX = 20;
      let y = doc.y;

      // Header background
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 20).fill('#2563eb');

      // Header text
      let x = startX;
      headers.forEach((header, i) => {
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff')
          .text(header, x + 2, y + 5, { width: colWidths[i] - 4, align: 'left' });
        x += colWidths[i];
      });

      y += 20;

      // Table rows
      if (students && students.length > 0) {
        students.forEach((student, index) => {
          if (y > 520) {
            doc.addPage();
            y = 30;
          }

          const bgColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
          doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 18).fill(bgColor);

          const rowData = [
            student.reference_id || '',
            student.s_no || String(index + 1),
            student.full_name || '',
            student.counselor_name || '',
            student.college_name || '',
            student.department || '',
            student.course_opted || student.course_name || '',
            `₹${parseFloat(student.amount_received || student.payment_amount || 0).toFixed(0)}`,
            `₹${parseFloat(student.pending_amount || 0).toFixed(0)}`,
            student.revenue_channel || ''
          ];

          x = startX;
          rowData.forEach((data, i) => {
            doc.fontSize(7).font('Helvetica').fillColor('#1e293b')
              .text(String(data), x + 2, y + 4, { width: colWidths[i] - 4, align: 'left' });
            x += colWidths[i];
          });

          y += 18;
        });
      } else {
        doc.moveDown(1);
        doc.fontSize(12).fillColor('#64748b').text('No student records found.', { align: 'center' });
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).fillColor('#94a3b8')
        .text(`Total Students: ${students ? students.length : 0}`, { align: 'left' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export students as Excel
 */
const exportStudentsExcel = async (students) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Jenovate Verification System';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Students');

  // Define columns matching 24 fields
  sheet.columns = [
    { header: 'Reference ID', key: 'reference_id', width: 18 },
    { header: 'S.no', key: 's_no', width: 10 },
    { header: 'Remarks', key: 'remarks', width: 18 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Academic Remarks', key: 'academic_remarks', width: 22 },
    { header: 'Counselor Name', key: 'counselor_name', width: 20 },
    { header: 'Student Name', key: 'full_name', width: 25 },
    { header: 'Phone No.', key: 'phone_no', width: 16 },
    { header: 'WhatsApp Number', key: 'whatsapp_number', width: 18 },
    { header: 'E-mail', key: 'email', width: 28 },
    { header: 'College Name', key: 'college_name', width: 30 },
    { header: 'State', key: 'state', width: 16 },
    { header: 'Department', key: 'department', width: 18 },
    { header: 'Course Opted', key: 'course_opted', width: 25 },
    { header: 'Primary Course', key: 'primary_course', width: 22 },
    { header: 'Secondary Course', key: 'secondary_course', width: 20 },
    { header: 'Tertiary Course', key: 'tertiary_course', width: 20 },
    { header: 'Type of Pack', key: 'type_of_pack', width: 16 },
    { header: 'Month Opted', key: 'month_opted', width: 14 },
    { header: 'Type of Course', key: 'type_of_course', width: 25 },
    { header: 'Payment Mode', key: 'payment_mode', width: 16 },
    { header: 'Program Price', key: 'program_price', width: 15 },
    { header: 'Amount Received', key: 'amount_received', width: 16 },
    { header: 'Pending Amount', key: 'pending_amount', width: 16 },
    { header: 'Revenue Channel', key: 'revenue_channel', width: 20 }
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 11
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Add data rows
  if (students && students.length > 0) {
    students.forEach((student, idx) => {
      sheet.addRow({
        reference_id: student.reference_id || '',
        s_no: student.s_no || idx + 1,
        remarks: student.remarks || '',
        date: student.date || '',
        academic_remarks: student.academic_remarks || '',
        counselor_name: student.counselor_name || '',
        full_name: student.full_name || '',
        phone_no: student.phone_no || student.mobile || '',
        whatsapp_number: student.whatsapp_number || '',
        email: student.email || '',
        college_name: student.college_name || '',
        state: student.state || '',
        department: student.department || '',
        course_opted: student.course_opted || student.course_name || '',
        primary_course: student.primary_course || '',
        secondary_course: student.secondary_course || '',
        tertiary_course: student.tertiary_course || '',
        type_of_pack: student.type_of_pack || '',
        month_opted: student.month_opted || '',
        type_of_course: student.type_of_course || '',
        payment_mode: student.payment_mode || '',
        program_price: parseFloat(student.program_price || 0),
        amount_received: parseFloat(student.amount_received || student.payment_amount || 0),
        pending_amount: parseFloat(student.pending_amount || 0),
        revenue_channel: student.revenue_channel || ''
      });
    });
  }

  // Style data rows
  for (let i = 2; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      cell.alignment = { vertical: 'middle' };
    });
    if (i % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' }
        };
      });
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

/**
 * Export verification results as PDF
 */
const exportVerificationPDF = async (results) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Title
      doc.fontSize(20).font('Helvetica-Bold').text('Jenovate Verification System', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica').text('Verification Report', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(1);

      // Table headers
      const headers = ['Ref ID', 'Match Status', 'Fraud Score', 'Fraud Level', 'Difference', 'Verified At'];
      const colWidths = [120, 100, 80, 110, 100, 120];
      const startX = 30;
      let y = doc.y;

      // Header background
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 20).fill('#2563eb');

      // Header text
      let x = startX;
      headers.forEach((header, i) => {
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff')
          .text(header, x + 4, y + 5, { width: colWidths[i] - 8, align: 'left' });
        x += colWidths[i];
      });

      y += 20;

      // Table rows
      if (results && results.length > 0) {
        results.forEach((result, index) => {
          if (y > 520) {
            doc.addPage();
            y = 30;
          }

          const bgColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
          doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 18).fill(bgColor);

          // Color code match status
          let statusColor = '#1e293b';
          if (result.match_status === 'MATCH') statusColor = '#16a34a';
          else if (result.match_status === 'MISMATCH') statusColor = '#dc2626';

          const rowData = [
            { text: result.reference_id || '', color: '#1e293b' },
            { text: result.match_status || '', color: statusColor },
            { text: String(result.fraud_score || 0), color: '#1e293b' },
            { text: result.fraud_level || '', color: result.fraud_level === 'HIGH_RISK' ? '#dc2626' : '#1e293b' },
            { text: `₹${parseFloat(result.difference_amount || 0).toFixed(2)}`, color: '#1e293b' },
            { text: result.verified_at ? new Date(result.verified_at).toLocaleDateString() : '', color: '#1e293b' }
          ];

          x = startX;
          rowData.forEach((data, i) => {
            doc.fontSize(8).font('Helvetica').fillColor(data.color)
              .text(data.text, x + 4, y + 4, { width: colWidths[i] - 8, align: 'left' });
            x += colWidths[i];
          });

          y += 18;
        });
      } else {
        doc.moveDown(1);
        doc.fontSize(12).fillColor('#64748b').text('No verification results found.', { align: 'center' });
      }

      // Summary
      doc.moveDown(2);
      const matches = results ? results.filter((r) => r.match_status === 'MATCH').length : 0;
      const mismatches = results ? results.filter((r) => r.match_status === 'MISMATCH').length : 0;
      doc.fontSize(8).fillColor('#94a3b8')
        .text(`Total: ${results ? results.length : 0} | Matches: ${matches} | Mismatches: ${mismatches}`, { align: 'left' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export verification results as Excel
 */
const exportVerificationExcel = async (results) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Jenovate Verification System';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Verification Results');

  // Define columns
  sheet.columns = [
    { header: 'Reference ID', key: 'reference_id', width: 18 },
    { header: 'Match Status', key: 'match_status', width: 15 },
    { header: 'Fraud Score', key: 'fraud_score', width: 12 },
    { header: 'Fraud Level', key: 'fraud_level', width: 18 },
    { header: 'Difference Amount', key: 'difference_amount', width: 18 },
    { header: 'Remarks', key: 'remarks', width: 35 },
    { header: 'Verified At', key: 'verified_at', width: 20 }
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 11
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Add data rows
  if (results && results.length > 0) {
    results.forEach((result) => {
      const row = sheet.addRow({
        reference_id: result.reference_id || '',
        match_status: result.match_status || '',
        fraud_score: result.fraud_score || 0,
        fraud_level: result.fraud_level || '',
        difference_amount: parseFloat(result.difference_amount || 0),
        remarks: result.remarks || '',
        verified_at: result.verified_at
          ? new Date(result.verified_at).toLocaleString()
          : ''
      });

      // Color code match status cells
      const statusCell = row.getCell('match_status');
      if (result.match_status === 'MATCH') {
        statusCell.font = { color: { argb: 'FF16A34A' }, bold: true };
      } else if (result.match_status === 'MISMATCH') {
        statusCell.font = { color: { argb: 'FFDC2626' }, bold: true };
      }

      // Color code fraud level cells
      const fraudCell = row.getCell('fraud_level');
      if (result.fraud_level === 'HIGH_RISK') {
        fraudCell.font = { color: { argb: 'FFDC2626' }, bold: true };
        fraudCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEF2F2' }
        };
      } else if (result.fraud_level === 'REVIEW_REQUIRED') {
        fraudCell.font = { color: { argb: 'FFD97706' }, bold: true };
        fraudCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFBEB' }
        };
      }
    });
  }

  // Style data rows borders
  for (let i = 2; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      cell.alignment = { vertical: 'middle' };
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = {
  exportStudentsPDF,
  exportStudentsExcel,
  exportVerificationPDF,
  exportVerificationExcel
};
