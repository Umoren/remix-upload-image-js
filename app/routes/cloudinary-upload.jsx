import {
    json,
    unstable_composeUploadHandlers as composeUploadHandlers,
    unstable_createMemoryUploadHandler as createMemoryUploadHandler,
    unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";

import { Form, useActionData } from "@remix-run/react";

import { uploadImage } from "~/utils/utils.server";

import formStylesUrl from "~/styles/form.css";

export const links = () => {
    return [{ rel: "stylesheet", href: formStylesUrl }];
};

export const action = async ({ request }) => {
    const uploadHandler = composeUploadHandlers(
        async ({ name, data, filename }) => {
            if (name !== "img") {
                return undefined
            }
            console.log(filename)
            const uploadedImage = await uploadImage(data)
            console.log(uploadedImage.secure_url)
            return uploadedImage.secure_url;
        },
        createMemoryUploadHandler()
    );

    const formData = await parseMultipartFormData(request, uploadHandler);
    const imgSource = formData.get("img");
    const imgDescription = formData.get("description");
    if (!imgSource) {
        return json({
            error: "something is wrong",
        });
    }
    return json({
        imgSource, imgDescription
    });
};

export default function Index() {
    const data = useActionData();
    return (
        <>
            <Form method="post" encType="multipart/form-data" id="upload-form">
                <div>
                    <label htmlFor="img"> Image: </label>
                    <input id="img" type="file" name="img" accept="image/*" />
                </div>

                <div>
                    <label htmlFor="description"> Image description: </label>
                    <input id="description" type="text" name="description" />
                </div>

                <div>
                    <button type="submit"> Upload to Cloudinary </button>
                </div>
            </Form>

            {data?.errorMsg && <h3>{data.errorMsg}</h3>}
            {data?.imgSource && (
                <>
                    <h2>Uploaded Image: </h2>
                    <img src={data.imgSource} alt={data.imgDescription || "Upload result"} />
                    <p>{data.imgDescription}</p>
                </>
            )}
        </>
    )
}

export function ErrorBoundary() {
    return (
        <div className="error-container">
            Server Error
        </div>
    );
}