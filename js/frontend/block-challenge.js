/**
 * EcoRuta — Frontend: mini editor de bloques (estilo Scratch/mBlock) para el
 * reto "Programa a Sendel". Pensado para niños de 6 a 12 años: arrastrar y
 * soltar en vez de escribir código.
 */
(function (global) {
  'use strict';

  class BlockChallenge {
    constructor({ slotId, paletteId, runBtnId, feedbackId, labelId }) {
      this.slotEl = document.getElementById(slotId);
      this.paletteEl = document.getElementById(paletteId);
      this.runBtn = document.getElementById(runBtnId);
      this.feedbackEl = document.getElementById(feedbackId);
      this.labelEl = document.getElementById(labelId);
      this.placedBlock = null;
      this.onResolved = null; // (blockId, correct) => void
      this.runBtn.addEventListener('click', () => this._run());
    }

    open(obstacleLabel, blocks) {
      this.labelEl.textContent = `🎯 Obstáculo: ${obstacleLabel}`;
      this.feedbackEl.textContent = '';
      this.feedbackEl.className = 'challenge-feedback';
      this.placedBlock = null;
      this.runBtn.disabled = true;
      this._renderSlot();
      this._renderPalette(blocks);
    }

    _renderPalette(blocks) {
      this.paletteEl.innerHTML = '';
      blocks.forEach((block) => {
        const el = document.createElement('div');
        el.className = 'block-piece';
        el.dataset.blockId = block.id;
        el.innerHTML = `<span class="block-icon">${block.icon}</span><span class="block-label">${block.label}</span>`;
        this._makeDraggable(el, block);
        this.paletteEl.appendChild(el);
      });
    }

    _renderSlot() {
      this.slotEl.innerHTML = '<span class="slot-placeholder">Arrastra un bloque aquí ⬇</span>';
      this.slotEl.classList.remove('filled');
    }

    _makeDraggable(el, block) {
      el.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        const rect = el.getBoundingClientRect();
        const offsetX = ev.clientX - rect.left;
        const offsetY = ev.clientY - rect.top;

        const ghost = el.cloneNode(true);
        ghost.classList.add('block-ghost');
        ghost.style.width = `${rect.width}px`;
        document.body.appendChild(ghost);

        const place = (clientX, clientY) => {
          ghost.style.left = `${clientX - offsetX}px`;
          ghost.style.top = `${clientY - offsetY}px`;
        };
        place(ev.clientX, ev.clientY);
        el.classList.add('dragging-source');
        this.slotEl.classList.add('drop-armed');

        const onMove = (moveEv) => {
          place(moveEv.clientX, moveEv.clientY);
          const slotRect = this.slotEl.getBoundingClientRect();
          const over =
            moveEv.clientX >= slotRect.left &&
            moveEv.clientX <= slotRect.right &&
            moveEv.clientY >= slotRect.top &&
            moveEv.clientY <= slotRect.bottom;
          this.slotEl.classList.toggle('drop-hover', over);
        };

        const onUp = (upEv) => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          el.classList.remove('dragging-source');
          this.slotEl.classList.remove('drop-armed', 'drop-hover');
          const slotRect = this.slotEl.getBoundingClientRect();
          const dropped =
            upEv.clientX >= slotRect.left &&
            upEv.clientX <= slotRect.right &&
            upEv.clientY >= slotRect.top &&
            upEv.clientY <= slotRect.bottom;
          ghost.remove();
          if (dropped) this._placeBlock(block);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      });
    }

    _placeBlock(block) {
      this.placedBlock = block;
      this.slotEl.innerHTML = `<span class="block-icon">${block.icon}</span><span class="block-label">${block.label}</span>`;
      this.slotEl.classList.add('filled');
      this.runBtn.disabled = false;
      this.feedbackEl.textContent = '';
      this.feedbackEl.className = 'challenge-feedback';
    }

    _run() {
      if (!this.placedBlock) return;
      const block = this.placedBlock;
      const correct = block.correct === true;
      this.feedbackEl.textContent = block.feedback;
      this.feedbackEl.className = `challenge-feedback ${correct ? 'ok' : 'err'}`;
      if (!correct) {
        this.slotEl.classList.add('shake');
        setTimeout(() => this.slotEl.classList.remove('shake'), 400);
      } else {
        this.placedBlock = null;
        this.runBtn.disabled = true;
      }
      if (this.onResolved) this.onResolved(block.id, correct);
    }
  }

  global.EcoRuta = global.EcoRuta || {};
  global.EcoRuta.Frontend = global.EcoRuta.Frontend || {};
  global.EcoRuta.Frontend.BlockChallenge = BlockChallenge;
})(window);
