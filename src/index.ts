import { app } from './settings';

const port = process.env.PORT || 3999;

export enum CodeResponsesEnum {
    Created_201 = 201,
    Not_content_204 = 204,
    Incorrect_values_400 = 400,
    Not_found_404 = 404
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

export default app;
