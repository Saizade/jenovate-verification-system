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

      // Table headers
      const headers = ['Ref ID', 'Name', 'Course', 'Payment', 'Joining Date', 'City'];
      const colWidths = [110, 140, 130, 80, 90, 100];
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
            student.full_name || '',
            student.course_name || '',
            `₹${parseFloat(student.payment_amount || 0).toFixed(2)}`,
            student.joining_date || '',
            student.city || ''
          ];

          x = startX;
          rowData.forEach((data, i) => {
            doc.fontSize(8).font('Helvetica').fillColor('#1e293b')
              .text(String(data), x + 4, y + 4, { width: colWidths[i] - 8, align: 'left' });
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

  // Define columns
  sheet.columns = [
    { header: 'Reference ID', key: 'reference_id', width: 18 },
    { header: 'Full Name', key: 'full_name', width: 25 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Mobile', key: 'mobile', width: 15 },
    { header: 'Course', key: 'course_name', width: 20 },
    { header: 'Course Fee', key: 'course_fee', width: 12 },
    { header: 'Payment Amount', key: 'payment_amount', width: 15 },
    { header: 'Payment Mode', key: 'payment_mode', width: 15 },
    { header: 'Joining Date', key: 'joining_date', width: 15 },
    { header: 'City', key: 'city', width: 15 },
    { header: 'State', key: 'state', width: 15 }
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
    students.forEach((student) => {
      sheet.addRow({
        reference_id: student.reference_id || '',
        full_name: student.full_name || '',
        email: student.email || '',
        mobile: student.mobile || '',
        course_name: student.course_name || '',
        course_fee: parseFloat(student.course_fee || 0),
        payment_amount: parseFloat(student.payment_amount || 0),
        payment_mode: student.payment_mode || '',
        joining_date: student.joining_date || '',
        city: student.city || '',
        state: student.state || ''
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
