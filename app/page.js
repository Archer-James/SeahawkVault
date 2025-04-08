import React from "react";
import {Image} from "react";

const App = () => {
  return (
    <>
      <div className="content">
        <div className="page-title">
          <h1>Welcome to the Seahawk Vault!</h1>
        </div>

        <div className="vault-description">
          <p>
            The Vault is your personal space to store photos and memories throughout
            your college years. These moments will stay locked until graduation, when
            you can unlock them and relive your journey. Once you submit a photo, it will
            be locked until graduation!
          </p>
        </div>

        <div className="project-info">
          <p>
            This project is part of a student honors thesis, created by Archer James.
          </p>
        </div>

        {/* Testimonials Section */}
        <div className="testimonials">
          <h2 className="testimonials-title">What Students Are Saying</h2>

          <div className="testimonials-container">
            {/* Testimonial 1 */}
            <div className="testimonial-card">
              <img src="./clock.jpg" alt="User Testimonial" className="testimonial-img" />
              <p className="testimonial-text">
                &quot;Seahawk Vault is amazing! I can&apos;t wait to see all my college memories when I graduate.&quot;
              </p>
              <p className="testimonial-author">- Emily R.</p>
            </div>

            {/* Testimonial 2 */}
            <div className="testimonial-card">
              <img src="./clock.jpg" alt="User Testimonial" className="testimonial-img" />
              <p className="testimonial-text">
                &quot;I love knowing that my photos are stored and will be a surprise for my future self!&quot;
              </p>
              <p className="testimonial-author">- John D.</p>
            </div>

            {/* Testimonial 3 */}
            <div className="testimonial-card">
              <img src="./clock.jpg" alt="User Testimonial" className="testimonial-img" />
              <p className="testimonial-text">
                &quot;This is such a cool idea! It&apos;s like a digital time capsule for college students.&quot;
              </p>
              <p className="testimonial-author">- Jane D.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
