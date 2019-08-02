import * as JSZip from 'jszip';
import { MessageContstants } from './common/message.constants';

export class BravoZipTool {
    private _zipFile: JSZip = null;

    public get zipFile(): JSZip {
        return this._zipFile;
    }

    private _zFileName: string = null;

    public get zFileName(): string {
        return this._zipFile != null ? this._zipFile.name : null;
    }

    public set zFileName(zName: string) {
        this._zFileName = zName;
    }

    public static async open(data): Promise<BravoZipTool> {
        if (data instanceof Array) {
            var _zt = new BravoZipTool();
            _zt._zipFile = new JSZip();
            await _zt._zipFile.loadAsync(data);

            return _zt;
        }
    }

    public addComment(pzComment: string, pzEntryName?: string) {
        if (pzEntryName) {
            if (!this.containsEntry(pzEntryName))
                throw new Error(String.format(MessageContstants.EntryNameNotExist, pzEntryName));

            this.zipFile.filter((entryName, file) => {
                if (String.compare(pzEntryName, entryName) == 0) {
                    file.comment = pzComment;
                    return true;
                }

                return false;
            })
        }
        /* else {
            this.zipFile.comment = pzComment;
        } */
    }

    public addEntry(pzEntryName: string, data) {
        if (data instanceof Array) {
            this.zipFile.file(pzEntryName, data, { binary: true });
        }
        else if (data instanceof Object) {
            this.zipFile.file(pzEntryName, JSON.stringify(data));
        }
        else {
            this.zipFile.file(pzEntryName, data);
        }
    }

    public async readEntry(pzEntryName) {
        if (!this.containsEntry(pzEntryName)) {
            throw new Error(String.format(MessageContstants.EntryNameNotExist, pzEntryName));
        }

        return await this.zipFile.file(pzEntryName).async("text");
    }

    /* public readEntries(pzEntryName: string) {
        if (!this.containsEntry(pzEntryName))
            throw new Error(String.format(MessageContstants.EntryNameNotExist, pzEntryName));

        let change = this.zipFile.
    } */

    public removeEntry(pzEntryName: string) {
        if (!this.containsEntry(pzEntryName)) {
            throw new Error(String.format(MessageContstants.EntryNameNotExist, pzEntryName));
        }

        try {
            this.zipFile.remove(pzEntryName);
        }
        catch (e) {
            throw new Error(e);
        }
    }

    public containsEntry(pzEntryName: string) {
        if (!pzEntryName) return false;

        let _bMatch = false;
        this.zipFile.filter((entryName, file) => {
            if (String.compare(pzEntryName, entryName) == 0) {
                _bMatch = true;
                return true;
            }
        })

        return _bMatch;
    }

    public countsEntries() {
        return Object.keys(this.zipFile.files).length;
    }

    public async generate(option?) {
        if (!option) {
            return await this.zipFile.generateAsync({ type: "text" });
        }

        return await this.zipFile.generateAsync(option);
    }
}