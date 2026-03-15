import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
  ArrowLeft,
  Copy,
  Check,
  Brain,
  Camera,
  Database,
  Cpu,
  Smartphone,
  Layers,
  Zap,
  FileCode,
} from "lucide-react";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("protobuf", js);

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
}

interface SectionProps {
  id: string;
  number: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  children: React.ReactNode;
}

const CodeBlock = ({ code, language, title }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-border my-4 shadow-soft">
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-secondary border-b border-border">
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">{title}</span>
          <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors active-press">
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={atomOneDark}
        customStyle={{
          margin: 0,
          padding: "1.25rem",
          fontSize: "0.8125rem",
          lineHeight: "1.7",
          background: "hsl(240 10% 5%)",
          borderRadius: title ? 0 : "1rem",
        }}
        showLineNumbers={code.split("\n").length > 3}
        lineNumberStyle={{ color: "hsl(240 5% 30%)", paddingRight: "1rem", fontSize: "0.75rem" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

const DocSection = ({ id, number, title, icon, description, children }: SectionProps) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.4 }}
    className="scroll-mt-24"
  >
    <div className="flex items-start gap-4 mb-4">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
        {icon}
      </div>
      <div>
        <span className="text-label text-muted-foreground">Section {String(number).padStart(2, "0")}</span>
        <h2 className="text-xl font-semibold tracking-tight mt-1">{title}</h2>
      </div>
    </div>
    <div className="ml-14">
      <p className="text-muted-foreground leading-relaxed mb-6">{description}</p>
      {children}
    </div>
  </motion.section>
);

const tocItems = [
  { id: "overview", label: "Overview" },
  { id: "dataset", label: "Dataset Preparation" },
  { id: "training", label: "Model Training" },
  { id: "tflite", label: "TFLite Conversion" },
  { id: "inference", label: "Python Inference" },
  { id: "mobile", label: "Mobile Integration" },
  { id: "pipeline", label: "Full Pipeline" },
  { id: "tips", label: "Hackathon Tips" },
];

const AIVisionDocs = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors active-press">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-semibold tracking-tight">AI Vision Docs</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
        <aside className="hidden lg:block sticky top-24 self-start">
          <p className="text-label text-muted-foreground mb-4">On This Page</p>
          <nav className="space-y-1">
            {tocItems.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <span className="font-mono text-[10px] text-muted-foreground/60 w-5">{String(i + 1).padStart(2, "0")}</span>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
            <span className="text-label text-primary mb-3 block">Computer Vision Guide</span>
            <h1 className="text-display-xl !text-[clamp(1.75rem,5vw,2.75rem)] mb-4">
              AI Computer Vision Pipeline
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-6">
              Complete guide from dataset preparation and MobileNetV2 SSD training to TFLite conversion
              and on‑device inference integration for RecycleMate.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground">MobileNetV2 SSD</span>
              <span className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground">TensorFlow</span>
              <span className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground">TFLite</span>
              <span className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground">React Native</span>
              <span className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground">TACO Dataset</span>
            </div>
          </motion.div>

          <div className="space-y-16">
            {/* 1. Overview */}
            <DocSection
              id="overview"
              number={1}
              title="Overview"
              icon={<Brain className="w-5 h-5 text-primary" />}
              description="We train an object detection model to recognise common waste items directly on the user's mobile device. Object detection not only classifies items but also localises them with bounding boxes, allowing multiple items in a single frame."
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Architecture", value: "MobileNetV2 SSD", desc: "Lightweight, fast, mobile‑optimised" },
                  { label: "Input Size", value: "320 × 320", desc: "Balanced speed and accuracy" },
                  { label: "Output", value: "Multi‑Object", desc: "Boxes, classes, confidence scores" },
                ].map((item) => (
                  <div key={item.label} className="p-5 rounded-2xl border border-border bg-card">
                    <p className="text-label text-muted-foreground">{item.label}</p>
                    <p className="font-mono text-lg font-semibold tracking-tight mt-1">{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* 2. Dataset */}
            <DocSection
              id="dataset"
              number={2}
              title="Dataset Preparation"
              icon={<Database className="w-5 h-5 text-primary" />}
              description="Collect and annotate waste images. Use public datasets like TACO or capture your own. Annotate with LabelImg in Pascal VOC XML format."
            >
              <h3 className="font-semibold text-sm mb-2 mt-2">Directory Structure</h3>
              <CodeBlock
                title="Project Layout"
                language="bash"
                code={`dataset/
├── images/
│   ├── img001.jpg
│   ├── img002.jpg
│   └── ...
└── annotations/
    ├── img001.xml
    ├── img002.xml
    └── ...`}
              />

              <h3 className="font-semibold text-sm mb-2 mt-6">Label Map (label_map.pbtxt)</h3>
              <CodeBlock
                title="label_map.pbtxt"
                language="protobuf"
                code={`item {
  id: 1
  name: 'plastic_bottle'
}
item {
  id: 2
  name: 'aluminum_can'
}
item {
  id: 3
  name: 'newspaper'
}
item {
  id: 4
  name: 'cardboard'
}
item {
  id: 5
  name: 'plastic_bag'
}
item {
  id: 6
  name: 'styrofoam'
}`}
              />

              <h3 className="font-semibold text-sm mb-2 mt-6">Convert to TFRecord</h3>
              <CodeBlock
                title="create_tfrecord.py"
                language="python"
                code={`import os
import io
import pandas as pd
import tensorflow as tf
from PIL import Image
from object_detection.utils import dataset_util
from collections import namedtuple
import argparse
import xml.etree.ElementTree as ET

def xml_to_csv(path):
    """Iterates through all xml files and generates a single DataFrame."""
    xml_list = []
    for xml_file in os.listdir(path):
        if not xml_file.endswith('.xml'):
            continue
        with open(os.path.join(path, xml_file)) as f:
            tree = ET.parse(f)
            root = tree.getroot()
            for member in root.findall('object'):
                value = (root.find('filename').text,
                         int(root.find('size')[0].text),
                         int(root.find('size')[1].text),
                         member[0].text,
                         int(member[4][0].text),
                         int(member[4][1].text),
                         int(member[4][2].text),
                         int(member[4][3].text))
                xml_list.append(value)
    column_name = ['filename', 'width', 'height', 'class',
                   'xmin', 'ymin', 'xmax', 'ymax']
    xml_df = pd.DataFrame(xml_list, columns=column_name)
    return xml_df

def class_text_to_int(row_label, label_map_dict):
    return label_map_dict[row_label]

def split(df, group):
    data = namedtuple('data', ['filename', 'object'])
    gb = df.groupby(group)
    return [data(filename, gb.get_group(x))
            for filename, x in zip(gb.groups.keys(), gb.groups)]

def create_tf_example(group, path, label_map_dict):
    with tf.io.gfile.GFile(
        os.path.join(path, group.filename), 'rb') as fid:
        encoded_jpg = fid.read()
    encoded_jpg_io = io.BytesIO(encoded_jpg)
    image = Image.open(encoded_jpg_io)
    width, height = image.size

    filename = group.filename.encode('utf8')
    image_format = b'jpg'
    xmins, xmaxs, ymins, ymaxs = [], [], [], []
    classes_text, classes = [], []

    for index, row in group.object.iterrows():
        xmins.append(row['xmin'] / width)
        xmaxs.append(row['xmax'] / width)
        ymins.append(row['ymin'] / height)
        ymaxs.append(row['ymax'] / height)
        classes_text.append(row['class'].encode('utf8'))
        classes.append(class_text_to_int(row['class'], label_map_dict))

    tf_example = tf.train.Example(
        features=tf.train.Features(feature={
            'image/height': dataset_util.int64_feature(height),
            'image/width': dataset_util.int64_feature(width),
            'image/filename': dataset_util.bytes_feature(filename),
            'image/source_id': dataset_util.bytes_feature(filename),
            'image/encoded': dataset_util.bytes_feature(encoded_jpg),
            'image/format': dataset_util.bytes_feature(image_format),
            'image/object/bbox/xmin': dataset_util.float_list_feature(xmins),
            'image/object/bbox/xmax': dataset_util.float_list_feature(xmaxs),
            'image/object/bbox/ymin': dataset_util.float_list_feature(ymins),
            'image/object/bbox/ymax': dataset_util.float_list_feature(ymaxs),
            'image/object/class/text': dataset_util.bytes_list_feature(classes_text),
            'image/object/class/label': dataset_util.int64_list_feature(classes),
        }))
    return tf_example

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input_dir', required=True)
    parser.add_argument('--image_dir', required=True)
    parser.add_argument('--output_path', required=True)
    parser.add_argument('--label_map_path', required=True)
    args = parser.parse_args()

    label_map_dict = {}
    with open(args.label_map_path, 'r') as f:
        for line in f:
            if 'id' in line:
                id_ = int(line.split(':')[-1].strip())
            if 'name' in line:
                name = line.split(':')[-1].strip().replace("'", "").replace('"', '')
                label_map_dict[name] = id_

    xml_df = xml_to_csv(args.input_dir)
    grouped = split(xml_df, 'filename')

    writer = tf.io.TFRecordWriter(args.output_path)
    for group in grouped:
        tf_example = create_tf_example(group, args.image_dir, label_map_dict)
        writer.write(tf_example.SerializeToString())
    writer.close()
    print(f'Successfully created TFRecord: {args.output_path}')

if __name__ == '__main__':
    main()`}
              />

              <CodeBlock
                title="Generate Train & Validation Records"
                language="bash"
                code={`python create_tfrecord.py \\
  --input_dir=annotations/train \\
  --image_dir=images/train \\
  --output_path=data/train.record \\
  --label_map_path=label_map.pbtxt

python create_tfrecord.py \\
  --input_dir=annotations/val \\
  --image_dir=images/val \\
  --output_path=data/val.record \\
  --label_map_path=label_map.pbtxt`}
              />
            </DocSection>

            {/* 3. Training */}
            <DocSection
              id="training"
              number={3}
              title="Training with TF Object Detection API"
              icon={<Cpu className="w-5 h-5 text-primary" />}
              description="Use a pre‑trained SSD MobileNet V2 FPNLite 320×320 checkpoint with transfer learning. Configure the pipeline, train, and export."
            >
              <h3 className="font-semibold text-sm mb-2">Pipeline Configuration</h3>
              <CodeBlock
                title="pipeline.config (key sections)"
                language="protobuf"
                code={`model {
  ssd {
    num_classes: 10   # set to your number of classes
    image_resizer {
      fixed_shape_resizer {
        height: 320
        width: 320
      }
    }
    feature_extractor {
      type: 'ssd_mobilenet_v2_fpn_keras'
      depth_multiplier: 1.0
      min_depth: 16
    }
  }
}

train_config {
  batch_size: 16
  num_steps: 20000
  optimizer {
    momentum_optimizer {
      learning_rate {
        cosine_decay_learning_rate {
          learning_rate_base: 0.04
          total_steps: 20000
        }
      }
      momentum_optimizer_value: 0.9
    }
  }
  fine_tune_checkpoint: "ssd_mobilenet_v2_fpnlite_320x320/checkpoint/ckpt-0"
  fine_tune_checkpoint_type: "detection"
  fine_tune_checkpoint_version: V2
}

train_input_reader {
  label_map_path: "label_map.pbtxt"
  tf_record_input_reader {
    input_path: "data/train.record"
  }
}

eval_config {
  metrics_set: "coco_detection_metrics"
}

eval_input_reader {
  label_map_path: "label_map.pbtxt"
  tf_record_input_reader {
    input_path: "data/val.record"
  }
}`}
              />

              <h3 className="font-semibold text-sm mb-2 mt-6">Training & Monitoring</h3>
              <CodeBlock
                title="Training Commands"
                language="bash"
                code={`PIPELINE_CONFIG_PATH=/path/to/pipeline.config
MODEL_DIR=/path/to/training_dir

# Start training
python model_main_tf2.py \\
    --pipeline_config_path=\${PIPELINE_CONFIG_PATH} \\
    --model_dir=\${MODEL_DIR} \\
    --alsologtostderr

# Monitor with TensorBoard
tensorboard --logdir=\${MODEL_DIR}`}
              />

              <h3 className="font-semibold text-sm mb-2 mt-6">Export Inference Graph</h3>
              <CodeBlock
                title="Export Model"
                language="bash"
                code={`python exporter_main_v2.py \\
    --input_type image_tensor \\
    --pipeline_config_path \${PIPELINE_CONFIG_PATH} \\
    --trained_checkpoint_dir \${MODEL_DIR} \\
    --output_directory exported_model`}
              />
            </DocSection>

            {/* 4. TFLite Conversion */}
            <DocSection
              id="tflite"
              number={4}
              title="Convert to TensorFlow Lite"
              icon={<Smartphone className="w-5 h-5 text-primary" />}
              description="Convert the exported model to TFLite with post‑training quantization to reduce size and accelerate on‑device inference."
            >
              <CodeBlock
                title="TFLite Conversion (Python)"
                language="python"
                code={`import tensorflow as tf

# Load the saved model
saved_model_dir = 'exported_model/saved_model'
converter = tf.lite.TFLiteConverter.from_saved_model(saved_model_dir)

# Apply optimizations
converter.optimizations = [tf.lite.Optimize.DEFAULT]
# Float16 quantization (good balance of size vs accuracy)
converter.target_spec.supported_types = [tf.float16]

tflite_model = converter.convert()

# Save the model
with open('model.tflite', 'wb') as f:
    f.write(tflite_model)

print(f"Model size: {len(tflite_model) / 1024 / 1024:.1f} MB")`}
              />
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mt-4">
                <p className="text-sm text-foreground/80">
                  <strong>Tip:</strong> For full int8 quantization (even smaller models), provide a representative dataset
                  via <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">converter.representative_dataset</code>.
                </p>
              </div>
            </DocSection>

            {/* 5. Python Inference */}
            <DocSection
              id="inference"
              number={5}
              title="Running Inference (Python Testing)"
              icon={<FileCode className="w-5 h-5 text-primary" />}
              description="Test the exported TFLite model on sample images before deploying to mobile."
            >
              <CodeBlock
                title="TFLite Inference Script"
                language="python"
                code={`import numpy as np
import tensorflow as tf
from PIL import Image

# Load TFLite model
interpreter = tf.lite.Interpreter(model_path="model.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Load and preprocess image
image = Image.open("test.jpg").resize((320, 320))
input_data = np.expand_dims(
    np.array(image, dtype=np.float32) / 255.0, axis=0
)

# Set input and run
interpreter.set_tensor(input_details[0]['index'], input_data)
interpreter.invoke()

# Parse results
boxes = interpreter.get_tensor(output_details[0]['index'])[0]
classes = interpreter.get_tensor(output_details[1]['index'])[0]
scores = interpreter.get_tensor(output_details[2]['index'])[0]
num_detections = int(
    interpreter.get_tensor(output_details[3]['index'])[0]
)

# Filter by confidence threshold
threshold = 0.5
for i in range(num_detections):
    if scores[i] >= threshold:
        class_id = int(classes[i])
        score = scores[i]
        bbox = boxes[i]  # [ymin, xmin, ymax, xmax] normalized
        print(f"Class {class_id}: {score:.2f} at {bbox}")`}
              />
            </DocSection>

            {/* 6. Mobile Integration */}
            <DocSection
              id="mobile"
              number={6}
              title="Mobile Integration (React Native)"
              icon={<Camera className="w-5 h-5 text-primary" />}
              description="Integrate the TFLite model into your React Native app using react-native-fast-tflite for native performance."
            >
              <CodeBlock title="Install" language="bash" code={`npm install react-native-fast-tflite
cd ios && pod install`} />

              <CodeBlock
                title="services/tflite.js (Production)"
                language="javascript"
                code={`import { TFLite } from 'react-native-fast-tflite';
import * as FileSystem from 'expo-file-system';

const classNames = [
  'plastic_bottle', 'aluminum_can', 'newspaper',
  'cardboard', 'plastic_bag', 'styrofoam',
  'glass_bottle', 'food_waste', 'battery', 'electronic_waste'
];

let model = null;

export const loadModel = async () => {
  if (!model) {
    const modelUri = FileSystem.documentDirectory + 'model.tflite';
    await FileSystem.copyAsync({
      from: require('../../assets/model.tflite'),
      to: modelUri,
    });
    model = await TFLite.load(modelUri);
  }
  return model;
};

export const runInference = async (base64Image) => {
  await loadModel();

  // Convert base64 to raw bytes (RGB uint8)
  const imageBytes = Uint8Array.from(
    atob(base64Image), c => c.charCodeAt(0)
  );

  // Run inference – input shape [1, 320, 320, 3]
  const inputTensor = new TFLite.Tensor(imageBytes, [1, 320, 320, 3]);
  const outputs = await model.run([inputTensor]);

  // Parse outputs: [boxes, classes, scores, num_detections]
  const boxes = outputs[0].data;
  const classes = outputs[1].data;
  const scores = outputs[2].data;
  const numDetections = outputs[3].data[0];

  const detections = [];
  for (let i = 0; i < numDetections; i++) {
    if (scores[i] > 0.5) {
      detections.push({
        bbox: boxes.slice(i * 4, i * 4 + 4), // [ymin, xmin, ymax, xmax]
        class: classNames[classes[i]] || 'unknown',
        score: scores[i],
      });
    }
  }
  return detections;
};`}
              />

              <div className="p-4 rounded-xl bg-warning/5 border border-warning/20 mt-4">
                <p className="text-sm text-foreground/80">
                  <strong>Note:</strong> Output tensor format depends on your specific model export.
                  Verify the box coordinate order — typically <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">[ymin, xmin, ymax, xmax]</code> normalized.
                </p>
              </div>
            </DocSection>

            {/* 7. Full Pipeline */}
            <DocSection
              id="pipeline"
              number={7}
              title="Putting It All Together"
              icon={<Layers className="w-5 h-5 text-primary" />}
              description="The complete pipeline from camera capture to disposal instructions."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { step: "01", label: "Capture", desc: "Camera frame from device" },
                  { step: "02", label: "Preprocess", desc: "Resize 320×320, normalize [0,1]" },
                  { step: "03", label: "Inference", desc: "TFLite model detects objects" },
                  { step: "04", label: "Display", desc: "Bounding boxes + API instructions" },
                ].map((item) => (
                  <div key={item.step} className="p-5 rounded-2xl border border-border bg-card text-center">
                    <span className="font-mono text-xs text-primary tracking-wider">{item.step}</span>
                    <p className="font-semibold mt-2">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* 8. Tips */}
            <DocSection
              id="tips"
              number={8}
              title="Hackathon Tips"
              icon={<Zap className="w-5 h-5 text-primary" />}
              description="Practical advice to get the best results from your model during the hackathon."
            >
              <div className="space-y-3">
                {[
                  { title: "Data Augmentation", desc: "Use random horizontal flip, brightness, and crop in the training config to improve robustness." },
                  { title: "Class Imbalance", desc: "If some items appear rarely, collect more images or use class weighting in your loss function." },
                  { title: "On‑Device Performance", desc: "The 320×320 model runs in real‑time on modern smartphones. Use 224×224 for even faster speed." },
                  { title: "Edge Cases", desc: "Test under different lighting conditions and cluttered backgrounds to ensure reliability." },
                ].map((tip) => (
                  <div key={tip.title} className="p-5 rounded-2xl border border-border bg-card">
                    <p className="font-semibold text-sm">{tip.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </DocSection>
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 p-8 rounded-3xl bg-foreground text-background"
          >
            <Brain className="w-8 h-8 text-primary mb-4" />
            <h2 className="text-2xl font-semibold tracking-tight mb-3">Complete Pipeline Ready</h2>
            <p className="text-background/70 leading-relaxed">
              This complete computer vision pipeline gives RecycleMate a solid, working AI core — from data collection
              through model training to on‑device inference. Good luck with the 2030 AI Challenge!
            </p>
          </motion.div>

          <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to RecycleMate
            </Link>
            <Link to="/docs/graphql-security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              GraphQL Security →
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIVisionDocs;
