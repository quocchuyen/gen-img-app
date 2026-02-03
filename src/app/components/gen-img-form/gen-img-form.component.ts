import { Component, ChangeDetectionStrategy, signal, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AspectRatio, ImageModel } from '../../services/gemini.service';
import { STYLE_PRESETS, IMAGE_MODELS, ASPECT_RATIOS, ImageModelOption, ImageGenerateRequest, Option, SIZE, IMG_OPTIONS } from '../../models/image-generation.model';

@Component({
  selector: 'app-gen-img-form',
  templateUrl: './gen-img-form.component.html',
  imports: [CommonModule],
})
export class GenImgFormComponent {
  isLoading = input.required<boolean>();
  generate = output<ImageGenerateRequest & { stylePreset: string, token: string }>();

  readonly stylePresets = STYLE_PRESETS;
  readonly imageModels: Option[] = IMG_OPTIONS;
  readonly sizeOptions: Option[] = SIZE;

  prompt = signal<string>('A photorealistic portrait of a pensive android in a neon-lit alley.\nA majestic fantasy castle perched on a floating island at sunrise.\nA cute, fluffy red panda enjoying a bowl of ramen noodles.');
  size = signal<'1792x1024' | '1024x1024' | '1024x1792'>('1792x1024');
  numberOfImages = signal<number>(1);
  stylePreset = signal<string>('');
  token = signal<string>('');
  model = signal<string>('nano-banana');

  onTokenChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    this.token.set(value);
  }

  onNumberOfImagesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.valueAsNumber;
    if (isNaN(value)) {
      this.numberOfImages.set(1);
      return;
    }
    const clampedValue = Math.max(1, Math.min(4, value));
    this.numberOfImages.set(clampedValue);
  }

  handleFileInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    if (file.type !== 'text/plain') {
      console.error("Invalid file type. Please upload a .txt file.");
      target.value = ''; // Reset the input
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;
      if (content) {
        this.prompt.set(content);
      }
    };
    
    reader.onerror = () => {
        console.error("Error reading file:", reader.error);
    };

    reader.readAsText(file);
    
    // Reset the input value so the same file can be re-uploaded after changes
    target.value = '';
  }

  clearPrompt(): void {
    this.prompt.set('');
  }

  submitGeneration(): void {
    if (!this.prompt().trim()) {
      return;
    }
    this.generate.emit({
      prompt: this.prompt(),
      size: this.size(),
      n: this.numberOfImages(),
      stylePreset: this.stylePreset(),
      model: this.model(),
      token: this.token()
    });
  }
}
