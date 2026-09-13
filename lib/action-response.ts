export const SERVER_ERROR = "An unexpected server error occurred. Please try again.";

export interface ActionResponseJSON<T = unknown> {
    success: boolean;
    data: T | null;
    message: string;
    error?: string;
}

export default class ActionResponse<T = unknown> {
    public readonly success: boolean;
    private readonly _data: T | null;
    public readonly message: string;
    public readonly error?: string;

    constructor(data: T | null, message?: string, error?: string) {
        this.message = message || "";
        this._data = data;
        this.success = !error;

        if (error) {
            this.error = error;
        }
    }

    toJSON(): ActionResponseJSON<T> {
        return {
            success: this.success,
            data: this._data,
            message: this.message,
            ...(this.error && { error: this.error }),
        };
    }

    public static success<T>(data: T, message?: string): ActionResponseJSON<T> {
        return new ActionResponse<T>(data, message).toJSON();
    }

    public static error(error: string, message?: string): ActionResponseJSON<null> {
        return new ActionResponse<null>(null, message || "Error", error).toJSON();
    }
}
