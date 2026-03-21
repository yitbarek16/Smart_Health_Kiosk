import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../services/api_service.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  Uint8List? _receiptBytes;
  String? _receiptName;
  final _amountCtrl = TextEditingController(text: '500');
  String _paymentMethod = 'Telebirr';
  bool _loading = false;
  String? _message;
  bool _success = false;

  Future<void> _pickImage() async {
    final result = await FilePicker.platform.pickFiles(type: FileType.image, withData: true);
    if (result != null && result.files.single.bytes != null) {
      setState(() {
        _receiptBytes = result.files.single.bytes!;
        _receiptName = result.files.single.name;
      });
    }
  }

  Future<void> _submit() async {
    if (_receiptBytes == null) {
      setState(() => _message = 'Please select a receipt image');
      return;
    }
    setState(() { _loading = true; _message = null; });
    try {
      final res = await ApiService.uploadSubscriptionReceipt(
        receiptBytes: _receiptBytes!,
        receiptFilename: _receiptName ?? 'receipt.png',
        amount: double.parse(_amountCtrl.text),
        paymentMethod: _paymentMethod,
      );
      if (res.containsKey('subscription')) {
        setState(() { _success = true; _message = 'Subscription request submitted! Waiting for admin approval.'; });
      } else {
        setState(() => _message = res['error'] ?? 'Failed to submit');
      }
    } catch (e) {
      setState(() => _message = 'Error: $e');
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Subscribe')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Annual Subscription', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    const Text('Pay via bank transfer, Telebirr, or CBE Birr, then upload your receipt below.'),
                    const SizedBox(height: 16),
                    const Text('Amount: 500 ETB / year', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            TextField(controller: _amountCtrl, decoration: const InputDecoration(labelText: 'Amount (ETB)', border: OutlineInputBorder()), keyboardType: TextInputType.number),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _paymentMethod,
              decoration: const InputDecoration(labelText: 'Payment Method', border: OutlineInputBorder()),
              items: ['Telebirr', 'CBE Birr', 'Bank Transfer', 'Other'].map((m) => DropdownMenuItem(value: m, child: Text(m))).toList(),
              onChanged: (v) => setState(() => _paymentMethod = v!),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: _pickImage,
              icon: const Icon(Icons.upload_file),
              label: Text(_receiptBytes == null ? 'Upload Receipt Photo' : 'Receipt Selected'),
            ),
            if (_receiptBytes != null) Padding(
              padding: const EdgeInsets.only(top: 12),
              child: ClipRRect(borderRadius: BorderRadius.circular(12), child: Image.memory(_receiptBytes!, height: 200, fit: BoxFit.cover)),
            ),
            const SizedBox(height: 24),
            if (_message != null) Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(color: _success ? Colors.green.shade50 : Colors.red.shade50, borderRadius: BorderRadius.circular(12)),
              child: Text(_message!, style: TextStyle(color: _success ? Colors.green.shade700 : Colors.red.shade700)),
            ),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _loading || _success ? null : _submit,
                child: _loading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Submit Subscription Request'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
