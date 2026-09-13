import ActionResponse, { SERVER_ERROR, type ActionResponseJSON } from "./action-response";

type AsyncHandlerFunction<T, P = void> = (params: P) => Promise<T>;

export function asyncHandler<T, P = unknown>(
    handler: AsyncHandlerFunction<T, P>
) {
    return async (params: P): Promise<ActionResponseJSON<T> | ActionResponseJSON<null>> => {
        try {
            const result = await handler(params);
            return ActionResponse.success(result);
        } catch (error: unknown) {
            console.error("Async Handler Error:", error);
            if (error instanceof Error) {
                return ActionResponse.error(error.message);
            }
            return ActionResponse.error(SERVER_ERROR);
        }
    };
}
